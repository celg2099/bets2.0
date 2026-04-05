import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HotListService } from '../core/services/hot-list.service';
import { EmailHotListService } from '../core/services/email-hot-list.service';
import { PdfHotListService } from '../core/services/pdf-hot-list.service';
import { SchedulerHotListService } from '../core/services/scheduler-hot-list.service';
import { HistAcumRow, HotCheck } from '../core/interfaces/results.interface';

type SubTab = 'todos' | 'hot' | 'historico';
type MainCol = 'pais' | 'conteoActual' | 'maxConteo' | 'gamesFinished' | 'totDraw' | 'percentDraw' | 'dateNextGame';
type HistCol = 'pais' | 'pctInmediato' | 'pctLeq3' | 'pctLeq5' | 'pctLeq7';

@Component({
  selector: 'app-hot-list',
  imports: [DecimalPipe],
  templateUrl: './hot-list.component.html',
  styleUrl: './hot-list.component.scss',
})
export class HotListComponent {
  hotListSvc = inject(HotListService);
  emailSvc = inject(EmailHotListService);
  pdfSvc = inject(PdfHotListService);
  schedulerSvc = inject(SchedulerHotListService);

  // ─── Toolbar toggles ─────────────────────────────────────
  enviarEmail = signal(false);
  generarPdf = signal(false);
  limitarAcumulado = signal(true);

  enviandoEmail = signal(false);
  emailOk = signal<boolean | null>(null);

  // ─── Tabs ────────────────────────────────────────────────
  activeSubTab = signal<SubTab>('todos');

  // ─── Sort: main table ────────────────────────────────────
  mainCol = signal<MainCol>('pais');
  mainAsc = signal(true);

  // ─── Sort: historico table ────────────────────────────────
  histCol = signal<HistCol>('pctInmediato');
  histAsc = signal(false);

  // ─── Data ─────────────────────────────────────────────────
  loading = computed(() => this.hotListSvc.loading());
  progreso = computed(() => this.hotListSvc.progreso());
  total = computed(() => this.hotListSvc.total());

  listaOrdenada = computed(() => this.applyMainSort(this.hotListSvc.lista()));
  hotOrdenada = computed(() => this.applyMainSort(this.hotListSvc.listaHot()));

  historico = computed(() => {
    const col = this.histCol();
    const asc = this.histAsc();
    return [...this.hotListSvc.listaHistorico()].sort((a, b) => {
      const va = a[col as keyof HistAcumRow];
      const vb = b[col as keyof HistAcumRow];
      if (typeof va === 'string') return asc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return asc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  });

  histTopValues = computed(() => {
    const rows = this.hotListSvc.listaHistorico();
    const cols: HistCol[] = ['pctInmediato', 'pctLeq3', 'pctLeq5', 'pctLeq7'];
    const result: Record<string, [number, number]> = {};
    for (const col of cols) {
      const vals = [...new Set(rows.map((r) => r[col as keyof HistAcumRow] as number))].sort((a, b) => b - a);
      result[col] = [vals[0] ?? -Infinity, vals[1] ?? -Infinity];
    }
    return result;
  });

  progresoPct = computed(() => {
    const t = this.total();
    return t > 0 ? (this.progreso() / t) * 100 : 0;
  });

  private applyMainSort(rows: HotCheck[]): HotCheck[] {
    const col = this.mainCol();
    const asc = this.mainAsc();
    return [...rows].sort((a, b) => {
      const va = a[col as keyof HotCheck];
      const vb = b[col as keyof HotCheck];
      if (typeof va === 'string') return asc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return asc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }

  // ─── Actions ─────────────────────────────────────────────
  setSubTab(tab: SubTab): void {
    this.activeSubTab.set(tab);
  }

  clickMainSort(col: MainCol): void {
    if (this.mainCol() === col) {
      this.mainAsc.update((v) => !v);
    } else {
      this.mainCol.set(col);
      this.mainAsc.set(true);
    }
  }

  clickHistSort(col: HistCol): void {
    if (this.histCol() === col) {
      this.histAsc.update((v) => !v);
    } else {
      this.histCol.set(col);
      this.histAsc.set(col === 'pais');
    }
  }

  isHot(item: HotCheck): boolean {
    return item.conteoActual >= item.maxConteo - 2;
  }

  async generar(): Promise<void> {
    this.emailOk.set(null);
    this.hotListSvc.generarLista();
    await this.waitForLoad();

    if (this.generarPdf()) {
      const html = this.emailSvc.buildResumenHotHtml(
        this.hotListSvc.listaHot(),
        this.hotListSvc.listaHistorico(),
        this.hotListSvc.lista(),
        this.limitarAcumulado()
      );
      this.pdfSvc.descargar(html);
    }

    if (this.enviarEmail()) {
      this.enviandoEmail.set(true);
      try {
        await this.emailSvc.enviar(
          this.hotListSvc.listaHot(),
          this.hotListSvc.listaHistorico(),
          this.hotListSvc.lista(),
          this.limitarAcumulado()
        );
        this.emailOk.set(true);
      } catch {
        this.emailOk.set(false);
      } finally {
        this.enviandoEmail.set(false);
      }
    }
  }

  toggleScheduler(): void {
    this.schedulerSvc.enabled.update((v) => !v);
  }

  private waitForLoad(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.hotListSvc.loading()) resolve();
        else setTimeout(check, 300);
      };
      setTimeout(check, 300);
    });
  }
}
