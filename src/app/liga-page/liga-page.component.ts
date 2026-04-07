import { Component, inject, computed, signal, effect } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LigasService } from '../core/services/ligas.service';
import { LigaDataService } from '../core/services/liga-data.service';
import { ResultadosComponent } from './resultados/resultados.component';
import { ProximosJuegosComponent } from './proximos-juegos/proximos-juegos.component';
import { HistoricoLigaComponent } from './historico-liga/historico-liga.component';
import { DataAnalisisComponent } from './data-analisis/data-analisis.component';
import { ListStatics } from '../core/interfaces/results.interface';

type Tab = 'resultados' | 'proximos' | 'historico' | 'analisis';

@Component({
  selector: 'app-liga-page',
  imports: [DatePipe, DecimalPipe, ResultadosComponent, ProximosJuegosComponent, HistoricoLigaComponent, DataAnalisisComponent],
  templateUrl: './liga-page.component.html',
  styleUrl: './liga-page.component.scss',
})
export class LigaPageComponent {
  ligasService = inject(LigasService);
  ligaData = inject(LigaDataService);

  activeTab = signal<Tab>('resultados');

  liga = computed(() => this.ligasService.ligaSeleccionada());
  loading = computed(() => this.ligaData.loading());
  resultados = computed(() => this.ligaData.resultados());
  proximos = computed(() => this.ligaData.proximos());
  shortCount = computed(() => this.ligaData.shortCount());

  hayDatos = computed(
    () => this.resultados().length > 0 || this.proximos().length > 0
  );

  conteoActual = computed(() => this.ligaData.conteoActual());

  maxConteo = computed(() => {
    const sc = this.shortCount();
    return sc.length > 0 ? Math.max(...sc) : -1;
  });

  totDraw = computed(() => this.ligaData.totDraw());

  pctEmpates = computed(() => {
    const total = this.resultados().length;
    return total > 0 ? (this.totDraw() / total) * 100 : 0;
  });

  moda = computed(() => {
    const sc = this.shortCount();
    if (sc.length === 0) return -1;
    const aux: ListStatics[] = [];
    sc.forEach((itm) => {
      const found = aux.find((el) => el.valor === itm);
      if (!found) aux.push({ valor: itm, info: 1 });
      else found.info++;
    });
    const maxInfo = Math.max(...aux.map((o) => o.info));
    return aux.find((e) => e.info === maxInfo)?.valor ?? -1;
  });

  proximoJuego = computed(() => {
    const p = this.proximos();
    return p.length > 0 ? p[0].Date : null;
  });

  nombrePais = computed(() => this.liga()?.nombrePublico ?? '');

  nombreLiga = computed(() => {
    const api = this.liga()?.nombreForApi ?? '';
    const slash = api.indexOf('/');
    return slash >= 0 ? api.substring(slash + 1).replace(/\/$/, '') : api;
  });

  tieneAnalisis = computed(() => !!this.liga()?.archivoLigas);

  constructor() {
    // Reacciona cada vez que cambia la liga seleccionada
    effect(() => {
      const liga = this.ligasService.ligaSeleccionada();
      if (liga) {
        this.activeTab.set('resultados');
        this.ligaData.buscarResultados(liga.nombreForApi);
      }
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
