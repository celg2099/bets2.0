import { Component, OnInit, inject, computed } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { HotListService } from '../core/services/hot-list.service';
import { HotCheck } from '../core/interfaces/results.interface';

export interface SignalCombinada {
  pais: string;
  conteoActual: number;
  maxConteo: number;
  dateNextGame: string;
  percentDraw: number;
  pctInmediato: number | null;
  pctLeq3: number | null;
  score: number;
}

export interface GrupoHistograma {
  label: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  hotListSvc = inject(HotListService);

  loading    = computed(() => this.hotListSvc.loading());
  progreso   = computed(() => this.hotListSvc.progreso());
  total      = computed(() => this.hotListSvc.total());
  progresoPct = computed(() => {
    const t = this.total();
    return t > 0 ? (this.progreso() / t) * 100 : 0;
  });

  // ── Chips: resumen global ─────────────────────────────────

  totalLigas = computed(() => this.hotListSvc.lista().length);

  totalHot = computed(() => this.hotListSvc.listaHot().length);

  hotConProximoCount = computed(() =>
    this.hotListSvc.lista().filter(
      (r) => r.conteoActual >= r.maxConteo - 2 && r.dateNextGame !== ''
    ).length
  );

  pctEmpateGlobal = computed(() => {
    const lista = this.hotListSvc.lista();
    if (lista.length === 0) return 0;
    return lista.reduce((s, r) => s + r.percentDraw, 0) / lista.length;
  });

  // ── Top cards ─────────────────────────────────────────────

  mayorEmpateInmediato = computed(() => {
    const rows = this.hotListSvc.listaHistorico();
    if (rows.length === 0) return null;
    return rows.reduce((best, r) => (r.pctInmediato > best.pctInmediato ? r : best));
  });

  mayorConteoActual = computed<HotCheck | null>(() => {
    const lista = this.hotListSvc.lista();
    if (lista.length === 0) return null;
    return lista.reduce((best, r) => (r.conteoActual > best.conteoActual ? r : best));
  });

  proximoMayorEmpate = computed<HotCheck | null>(() => {
    const conProximo = this.hotListSvc.lista().filter((r) => r.dateNextGame !== '');
    if (conProximo.length === 0) return null;
    return conProximo.reduce((best, r) => (r.percentDraw > best.percentDraw ? r : best));
  });

  // ── Señal combinada ───────────────────────────────────────
  // Score 0-100: 40% racha/máximo + 35% pctInmediato + 25% pctLeq3

  senalCombinada = computed<SignalCombinada[]>(() => {
    const lista = this.hotListSvc.lista();
    const histMap = new Map(
      this.hotListSvc.listaHistorico().map((h) => [h.pais, h])
    );

    return lista
      .filter((r) => r.conteoActual >= r.maxConteo - 2 && r.dateNextGame !== '')
      .map((r) => {
        const h = histMap.get(r.pais) ?? null;
        const rachaFactor = r.maxConteo > 0 ? (r.conteoActual / r.maxConteo) * 40 : 0;
        const inmFactor   = h ? h.pctInmediato * 0.35 : 0;
        const leq3Factor  = h ? h.pctLeq3 * 0.25 : 0;
        return {
          pais: r.pais,
          conteoActual: r.conteoActual,
          maxConteo: r.maxConteo,
          dateNextGame: r.dateNextGame,
          percentDraw: r.percentDraw,
          pctInmediato: h ? h.pctInmediato : null,
          pctLeq3: h ? h.pctLeq3 : null,
          score: Math.round(rachaFactor + inmFactor + leq3Factor),
        };
      })
      .sort((a, b) => b.score - a.score);
  });

  scoreColor(score: number): string {
    if (score >= 70) return 'score-high';
    if (score >= 50) return 'score-mid';
    return 'score-low';
  }

  // ── Partidos de hoy ───────────────────────────────────────

  partidosHoy = computed<HotCheck[]>(() => {
    const now   = new Date();
    const dd    = now.getDate().toString().padStart(2, '0');
    const mm    = (now.getMonth() + 1).toString().padStart(2, '0');
    const yyyy  = now.getFullYear();
    const prefix = `${dd}/${mm}/${yyyy}`;
    return [...this.hotListSvc.lista()]
      .filter((r) => r.dateNextGame.startsWith(prefix))
      .sort((a, b) => b.percentDraw - a.percentDraw);
  });

  // ── Ranking histórico pctLeq3 ─────────────────────────────

  rankingLeq3 = computed(() =>
    [...this.hotListSvc.listaHistorico()]
      .sort((a, b) => b.pctLeq3 - a.pctLeq3)
      .slice(0, 10)
  );

  maxLeq3 = computed(() => {
    const r = this.rankingLeq3();
    return r.length > 0 ? Math.max(r[0].pctLeq3, 1) : 1;
  });

  // ── Top 10 rachas actuales ────────────────────────────────

  topRachas = computed<HotCheck[]>(() =>
    [...this.hotListSvc.lista()]
      .sort((a, b) => b.conteoActual - a.conteoActual)
      .slice(0, 10)
  );

  maxRachaActual = computed(() => {
    const top = this.topRachas();
    return top.length > 0 ? Math.max(top[0].conteoActual, 1) : 1;
  });

  barPct(conteo: number): number {
    return (conteo / this.maxRachaActual()) * 100;
  }

  // ── Histograma de distribución de rachas ─────────────────

  histograma = computed<GrupoHistograma[]>(() => {
    const lista = this.hotListSvc.lista();
    const grupos = [
      { label: '0',    min: 0,  max: 0  },
      { label: '1–3',  min: 1,  max: 3  },
      { label: '4–6',  min: 4,  max: 6  },
      { label: '7–10', min: 7,  max: 10 },
      { label: '10+',  min: 11, max: Infinity },
    ];
    const counts = grupos.map((g) =>
      lista.filter((r) => r.conteoActual >= g.min && r.conteoActual <= g.max).length
    );
    const maxCount = Math.max(...counts, 1);
    return grupos.map((g, i) => ({
      label: g.label,
      count: counts[i],
      pct: (counts[i] / maxCount) * 100,
    }));
  });

  // ── Helpers ───────────────────────────────────────────────

  isToday(dateNextGame: string): boolean {
    const today = new Date().toISOString().substring(0, 10);
    return dateNextGame.substring(0, 10) === today;
  }

  isSuperHot(item: { conteoActual: number; maxConteo: number }): boolean {
    return item.conteoActual >= item.maxConteo;
  }

  isHot(item: { conteoActual: number; maxConteo: number }): boolean {
    return item.conteoActual >= item.maxConteo - 2 && item.conteoActual < item.maxConteo;
  }

  ngOnInit(): void {
    if (this.hotListSvc.lista().length === 0 && !this.hotListSvc.loading()) {
      this.hotListSvc.generarLista();
    }
  }
}
