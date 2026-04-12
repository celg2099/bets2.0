import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, NgClass } from '@angular/common';
import { LigasService } from '../../core/services/ligas.service';
import { LigaDataService } from '../../core/services/liga-data.service';

// ─── Raw JSON interfaces ───────────────────────────────────
interface Gol {
  jugador: string;
  equipo: string;
  minuto: number;
  tiempoAdicional: number | null;
  periodo: number;
  tipo: string;
}

interface Partido {
  id: number;
  fechaHora: string;
  local: string;
  visitante: string;
  resultado?: { golesLocal: number; golesVisitante: number };
  estado: string;
  goles?: Gol[];
}

interface Torneo {
  tipo?: string;
  nombre: string;
  temporada?: string;
  año?: string;
  jornadas: { numero: number; partidos: Partido[] }[];
}

// Algunos JSONs usan "torneos", otros "temporadas"
interface LigaData {
  fuente: string;
  torneos?: Torneo[];
  temporadas?: Torneo[];
}

// ─── Output types ──────────────────────────────────────────
export interface TorneoRow {
  nombre: string;
  tipo: string;
  temporada: string;
  jugados: number;
  empates: number;
  pctEmpate: number;
  maxRacha: number;
  rachaPromedio: number;
  golesTotal: number;
  golesProm: number;
  golesP1: number;
  golesP2: number;
  penales: number;
  detalleGoles: 'completo' | 'parcial' | 'ninguno';
}

export interface MinutoFranja {
  label: string;
  count: number;
  pct: number;
}

export interface AnalisisGlobal {
  totalPartidos: number;
  totalGoles: number;
  golesProm: number;
  golesP1: number;
  golesP2: number;
  pctGolesP1: number;
  pctGolesP2: number;
  totalEmpates: number;
  pctEmpate: number;
  totalVLocal: number;
  totalVVisitante: number;
  pctVLocal: number;
  pctVVisitante: number;
  maxRachaHistorica: number;
  penales: number;
  pctPenales: number;
  franjas: MinutoFranja[];
  marcadores: { marcador: string; count: number; pct: number; esEmpate: boolean }[];
}

type DaTab = 'global' | 'torneos' | 'goles';

export interface PartidoResumen {
  local: string;
  visitante: string;
  golesLocal: number;
  golesVisitante: number;
  fecha: string;
  esEmpate: boolean;
}

@Component({
  selector: 'app-data-analisis',
  imports: [DecimalPipe, NgClass],
  templateUrl: './data-analisis.component.html',
  styleUrl: './data-analisis.component.scss',
})
export class DataAnalisisComponent implements OnInit {
  private http = inject(HttpClient);
  private ligasSvc = inject(LigasService);
  private ligaDataSvc = inject(LigaDataService);

  loading = signal(true);
  error = signal(false);
  fuente = signal('');
  daTab = signal<DaTab>('global');

  torneoRows = signal<TorneoRow[]>([]);
  analisis = signal<AnalisisGlobal | null>(null);
  selectedTorneoIdx = signal<number | null>(null);

  private rawTorneos: Torneo[] = [];

  selectedPartidos = computed<PartidoResumen[]>(() => {
    const idx = this.selectedTorneoIdx();
    if (idx === null || idx >= this.rawTorneos.length) return [];
    const t = this.rawTorneos[idx];
    return this.sortByFecha(
      t.jornadas.flatMap((j) => j.partidos).filter((p) => p.estado === 'Ended')
    )
      .reverse()
      .map((p) => ({
        local: p.local,
        visitante: p.visitante,
        golesLocal: p.resultado?.golesLocal ?? -1,
        golesVisitante: p.resultado?.golesVisitante ?? -1,
        fecha: p.fechaHora,
        esEmpate: (p.resultado?.golesLocal ?? -1) === (p.resultado?.golesVisitante ?? -2),
      }));
  });

  maxPctEmpate = computed(() => Math.max(...this.torneoRows().map((r) => r.pctEmpate), 1));
  maxRachaTorneo = computed(() => Math.max(...this.torneoRows().map((r) => r.maxRacha), 1));
  maxGolesProm = computed(() => Math.max(...this.torneoRows().map((r) => r.golesProm), 1));
  maxFranja = computed(() => {
    const a = this.analisis();
    return a ? Math.max(...a.franjas.map((f) => f.count), 1) : 1;
  });

  clasesFranja = computed(() => {
    const a = this.analisis();
    if (!a) return [];
    const maxPct = Math.max(...a.franjas.map((f) => f.pct));
    const hayEmpate = a.franjas.filter((f) => f.pct === maxPct).length > 1;
    return a.franjas.map((f) => {
      if (f.pct !== maxPct) return '';
      return hayEmpate ? 'franja-max-empate' : 'franja-max';
    });
  });

  maxMarcador = computed(() => {
    const a = this.analisis();
    return a ? Math.max(...a.marcadores.map((m) => m.count), 1) : 1;
  });

  ngOnInit(): void {
    const ligaActual = this.ligaDataSvc.ligaActual();
    const liga = this.ligasSvc.ligas.find((l) => l.nombreForApi === ligaActual);
    const archivo = liga?.archivoLigas;
    if (!archivo) { this.error.set(true); this.loading.set(false); return; }

    this.http.get<LigaData>(`/Ligas/${archivo}`).subscribe({
      next: (data) => {
        this.fuente.set(data.fuente ?? '');
        const torneos: Torneo[] = data.torneos ?? data.temporadas ?? [];
        this.rawTorneos = torneos;
        const rows = torneos.map((t) => this.calcTorneoRow(t));
        this.torneoRows.set(rows);
        this.analisis.set(this.calcAnalisis(torneos, rows));
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  setDaTab(tab: DaTab): void {
    this.daTab.set(tab);
  }

  selectTorneo(idx: number): void {
    this.selectedTorneoIdx.update((cur) => (cur === idx ? null : idx));
  }

  // fechaHora formato: "DD/MM/YYYY HH:mm"
  private parseFecha(fechaHora: string): number {
    if (!fechaHora) return 0;
    const [fecha, hora] = fechaHora.split(' ');
    const [d, m, y] = fecha.split('/');
    const [h, min] = (hora ?? '00:00').split(':');
    return new Date(+y, +m - 1, +d, +h, +min).getTime();
  }

  private sortByFecha(partidos: Partido[]): Partido[] {
    return [...partidos].sort((a, b) => this.parseFecha(a.fechaHora) - this.parseFecha(b.fechaHora));
  }

  // ─── Por torneo ────────────────────────────────────────────
  private calcTorneoRow(t: Torneo): TorneoRow {
    const partidos = this.sortByFecha(
      t.jornadas.flatMap((j) => j.partidos).filter((p) => p.estado === 'Ended')
    );
    const jugados = partidos.length;

    let conteo = 0;
    const rachas: number[] = [];
    let empates = 0, golesTotal = 0, golesP1 = 0, golesP2 = 0, penales = 0;
    let partidosConGoles = 0, partidosConDetalle = 0;

    for (const p of partidos) {
      const gl = p.resultado?.golesLocal ?? -1;
      const gv = p.resultado?.golesVisitante ?? -1;
      if (gl < 0 || gv < 0) continue;
      golesTotal += gl + gv;
      if (gl === gv) { empates++; rachas.push(conteo); conteo = 0; }
      else conteo++;
      for (const g of p.goles ?? []) {
        if (g.periodo === 1) golesP1++; else golesP2++;
        if (g.tipo === 'Penal') penales++;
      }
      if (gl + gv > 0) {
        partidosConGoles++;
        if (p.goles !== undefined && p.goles !== null && p.goles.length === gl + gv) {
          partidosConDetalle++;
        }
      }
    }
    rachas.push(conteo);

    const maxRacha = rachas.length > 0 ? Math.max(...rachas) : 0;
    const rachaPromedio = rachas.length > 1
      ? rachas.slice(0, -1).reduce((a, b) => a + b, 0) / (rachas.length - 1) : 0;

    let detalleGoles: 'completo' | 'parcial' | 'ninguno';
    if (partidosConGoles === 0 || partidosConDetalle === partidosConGoles) {
      detalleGoles = 'completo';
    } else if (partidosConDetalle === 0) {
      detalleGoles = 'ninguno';
    } else {
      detalleGoles = 'parcial';
    }

    return {
      nombre: t.nombre, tipo: t.tipo ?? '', temporada: t.temporada ?? t.año ?? '',
      jugados, empates,
      pctEmpate: jugados > 0 ? (empates / jugados) * 100 : 0,
      maxRacha, rachaPromedio,
      golesTotal, golesProm: jugados > 0 ? golesTotal / jugados : 0,
      golesP1, golesP2, penales, detalleGoles,
    };
  }

  // ─── Global (todos los torneos) ────────────────────────────
  private calcAnalisis(torneos: Torneo[], rows: TorneoRow[]): AnalisisGlobal {
    // maxRacha: el máximo de cada torneo por separado (la racha se reinicia por torneo)
    const maxRacha = Math.max(...rows.map((r) => r.maxRacha), 0);

    const todos = this.sortByFecha(
      torneos.flatMap((t) =>
        t.jornadas.flatMap((j) => j.partidos).filter((p) => p.estado === 'Ended')
      )
    );

    let totalGoles = 0, golesP1 = 0, golesP2 = 0, penales = 0;
    let empates = 0, vLocal = 0, vVisitante = 0;
    const FRANJAS = ['1-15', '16-30', '31-45', '46-60', '61-75', '76-90', '90+'];
    const fc = [0, 0, 0, 0, 0, 0, 0];
    const marcadorMap: Record<string, number> = {};

    for (const p of todos) {
      const gl = p.resultado?.golesLocal ?? -1;
      const gv = p.resultado?.golesVisitante ?? -1;
      if (gl < 0 || gv < 0) continue;
      totalGoles += gl + gv;
      if (gl > gv) vLocal++;
      else if (gv > gl) vVisitante++;
      else empates++;
      const key = `${gl}-${gv}`;
      marcadorMap[key] = (marcadorMap[key] ?? 0) + 1;

      for (const g of p.goles ?? []) {
        if (g.periodo === 1) golesP1++; else golesP2++;
        if (g.tipo === 'Penal') penales++;
        const min = g.minuto + (g.tiempoAdicional ?? 0);
        if (min <= 15) fc[0]++;
        else if (min <= 30) fc[1]++;
        else if (min <= 45) fc[2]++;
        else if (min <= 60) fc[3]++;
        else if (min <= 75) fc[4]++;
        else if (min <= 90) fc[5]++;
        else fc[6]++;
      }
    }

    const n = todos.length;
    const golesTracked = golesP1 + golesP2;
    const franjas: MinutoFranja[] = FRANJAS.map((label, i) => ({
      label, count: fc[i],
      pct: golesTracked > 0 ? (fc[i] / golesTracked) * 100 : 0,
    }));

    const marcadores = Object.entries(marcadorMap)
      .map(([marcador, count]) => {
        const [gl, gv] = marcador.split('-').map(Number);
        return { marcador, count, pct: +((count / n) * 100).toFixed(1), esEmpate: gl === gv };
      })
      .sort((a, b) => b.count - a.count);

    return {
      totalPartidos: n,
      totalGoles,
      golesProm: n > 0 ? totalGoles / n : 0,
      golesP1, golesP2,
      pctGolesP1: golesTracked > 0 ? (golesP1 / golesTracked) * 100 : 0,
      pctGolesP2: golesTracked > 0 ? (golesP2 / golesTracked) * 100 : 0,
      totalEmpates: empates,
      pctEmpate: n > 0 ? (empates / n) * 100 : 0,
      totalVLocal: vLocal, totalVVisitante: vVisitante,
      pctVLocal: n > 0 ? (vLocal / n) * 100 : 0,
      pctVVisitante: n > 0 ? (vVisitante / n) * 100 : 0,
      maxRachaHistorica: maxRacha,
      penales, pctPenales: golesTracked > 0 ? (penales / golesTracked) * 100 : 0,
      franjas, marcadores,
    };
  }
}
