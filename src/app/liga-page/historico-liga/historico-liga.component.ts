import { Component, inject, OnInit, signal } from '@angular/core';
import { LigaDataService } from '../../core/services/liga-data.service';
import { LigasService } from '../../core/services/ligas.service';
import { BdTempHistorica, StatsResult, TemporadaHistorica } from '../../core/interfaces/results.interface';
import { HistoricoTablaComponent } from './historico-tabla/historico-tabla.component';
import { HistoricoResumenComponent } from './historico-resumen/historico-resumen.component';
import { HistoricoAnualComponent } from './historico-anual/historico-anual.component';
import { HistoricoDistribucionComponent } from './historico-distribucion/historico-distribucion.component';
import { HistoricoPredComponent } from './historico-pred/historico-pred.component';

interface ComputedHistorico {
  statsGlobal: StatsResult;
  statsAnual: Array<{ temporada: string; s: StatsResult }>;
  frecuencias: Array<{ val: number; count: number; pct: number }>;
  percentiles: Array<{ label: string; value: number }>;
  probEmpate: Array<{ x: number; exacta: number; acum: number }>;
  maxAvgAnual: number;
  maxMaxAnual: number;
  maxFrecuencia: number;
  maxPercentil: number;
  maxProbExacta: number;
  pctRachaAlta: number;
}

type AnalisisTab = 'resumen' | 'anual' | 'dist' | 'pred';

@Component({
  selector: 'app-historico-liga',
  imports: [
    HistoricoTablaComponent,
    HistoricoResumenComponent,
    HistoricoAnualComponent,
    HistoricoDistribucionComponent,
    HistoricoPredComponent,
  ],
  templateUrl: './historico-liga.component.html',
  styleUrl: './historico-liga.component.scss',
})
export class HistoricoLigaComponent implements OnInit {
  ligaData = inject(LigaDataService);
  ligasService = inject(LigasService);

  bdHistorico = signal<BdTempHistorica | null>(null);
  error = signal(false);
  activeTab = signal<AnalisisTab>('resumen');
  computed = signal<ComputedHistorico | null>(null);

  ngOnInit(): void {
    this.cargarHistorico();
  }

  cargarHistorico(): void {
    this.error.set(false);
    this.bdHistorico.set(null);
    this.computed.set(null);

    const liga = this.ligaData.ligaActual();
    if (!liga) return;

    const nombrePublico = this.ligasService.ligas.find(
      (l) => l.nombreForApi === liga
    )?.nombrePublico;

    if (!nombrePublico) return;

    this.ligaData.getHistoricoLiga(nombrePublico).subscribe({
      next: (data) => {
        this.bdHistorico.set(data);
        this.activeTab.set('resumen');
        this.computed.set(this.computeAll(data));
      },
      error: () => this.error.set(true),
    });
  }

  get temporadas(): TemporadaHistorica[] {
    const historico = this.bdHistorico()?.temporadas ?? [];
    const actual = this.ligaData.temporadaActual();
    return actual ? [...historico, actual] : historico;
  }

  private computeAll(data: BdTempHistorica): ComputedHistorico {
    const temporadas = [
      ...data.temporadas,
      ...(this.ligaData.temporadaActual() ? [this.ligaData.temporadaActual()!] : []),
    ];
    const allVals = temporadas.flatMap((t) => t.conteos);
    const statsGlobal = this.calcStats(allVals);
    const statsAnual = temporadas.map((t) => ({ temporada: t.temporada, s: this.calcStats(t.conteos) }));

    const freq: Record<number, number> = {};
    allVals.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
    const n = allVals.length || 1;

    const frecuencias = Object.keys(freq)
      .map(Number)
      .sort((a, b) => a - b)
      .map((val) => ({ val, count: freq[val], pct: +(freq[val] / n * 100).toFixed(1) }));

    const percentiles = [
      { label: 'P25', value: statsGlobal.p25 },
      { label: 'P50 (mediana)', value: statsGlobal.p50 },
      { label: 'P75', value: statsGlobal.p75 },
      { label: 'P90', value: statsGlobal.p90 },
      { label: 'P95', value: statsGlobal.p95 },
    ];

    const probEmpate: Array<{ x: number; exacta: number; acum: number }> = [];
    let acum = 0;
    for (let k = 0; k <= 10; k++) {
      const exacta = +((freq[k] || 0) / n * 100).toFixed(1);
      acum = +(acum + exacta).toFixed(1);
      probEmpate.push({ x: k, exacta, acum });
    }

    return {
      statsGlobal,
      statsAnual,
      frecuencias,
      percentiles,
      probEmpate,
      maxAvgAnual: Math.max(...statsAnual.map((e) => e.s.avg), 1),
      maxMaxAnual: Math.max(...statsAnual.map((e) => e.s.max), 1),
      maxFrecuencia: Math.max(...frecuencias.map((f) => f.count), 1),
      maxPercentil: Math.max(...percentiles.map((p) => p.value), 1),
      maxProbExacta: Math.max(...probEmpate.map((p) => p.exacta), 1),
      pctRachaAlta: Math.round((allVals.filter((v) => v >= 9).length / n) * 100),
    };
  }

  private calcStats(vals: number[]): StatsResult {
    const n = vals.length;
    if (n === 0)
      return { n: 0, avg: 0, median: 0, max: 0, zeros: 0, moda: 0, std: 0, p25: 0, p50: 0, p75: 0, p90: 0, p95: 0 };
    const avg = vals.reduce((a, b) => a + b, 0) / n;
    const sorted = [...vals].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const max = Math.max(...vals);
    const zeros = vals.filter((v) => v === 0).length;
    const freq: Record<number, number> = {};
    vals.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
    const moda = Number(Object.entries(freq).sort((a, b) => +b[1] - +a[1])[0][0]);
    const std = Math.sqrt(vals.reduce((a, v) => a + Math.pow(v - avg, 2), 0) / n);
    const pct = (p: number) => sorted[Math.floor((p * n) / 100)];
    return { n, avg, median, max, zeros, moda, std, p25: pct(25), p50: pct(50), p75: pct(75), p90: pct(90), p95: pct(95) };
  }

  setTab(tab: AnalisisTab): void {
    this.activeTab.set(tab);
  }
}
