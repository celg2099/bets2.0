import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LigaDataService } from '../../core/services/liga-data.service';
import { Summary, ListStatics } from '../../core/interfaces/results.interface';

@Component({
  selector: 'app-detalle',
  imports: [DatePipe],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
})
export class DetalleComponent implements OnDestroy {
  ligaData = inject(LigaDataService);

  private destroy$ = new Subject<void>();

  procesando = signal(false);
  mostrarResumen = signal(false);
  errorCount = signal(0);
  conteoActualHt = signal(0);

  resultadosDetail = computed(() => this.ligaData.resultadosDetail());
  shortCountHt = computed(() => this.ligaData.shortCountHt());
  shortCountHtReverse = computed(() => [...this.ligaData.shortCountHt()].reverse());

  maxConteoHt = computed(() => {
    const sc = this.ligaData.shortCountHt();
    return sc.length > 0 ? Math.max(...sc) : -1;
  });

  juegosFinalizados = computed(() => this.ligaData.resultados());

  modaHt = computed(() => {
    const sc = this.ligaData.shortCountHt();
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

  cargarHtScores(): void {
    this.procesando.set(true);
    this.mostrarResumen.set(false);
    this.errorCount.set(0);
    this.ligaData.resultadosDetail.set([]);
    this.ligaData.shortCountHt.set([]);
    this.ligaData.totDrawHt.set(0);

    const resultados = this.ligaData.resultados();
    const total = resultados.length;
    let iteracion = 0;
    let errores = 0;
    const detalleTmp: Summary[] = [];

    resultados.forEach((game) => {
      const home = game.TLName.toLowerCase().replace(' ', '-');
      const away = game.TVName.toLowerCase().replace(' ', '-');
      const url = `${this.ligaData.currEvent}${home}-vrs-${away}/${game.Eid}/stats/`;

      this.ligaData
        .getDetailGame(url)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            const item: Summary = { ...game };
            const detalle = this.parseHtScore(data);
            if (detalle) {
              item.TLHtGoals = detalle.home;
              item.TVHtGoals = detalle.away;
            }
            detalleTmp.push(item);
            iteracion++;
            if (iteracion === total) this.finalizarHt(detalleTmp, errores);
          },
          error: () => {
            errores++;
            detalleTmp.push({ ...game });
            iteracion++;
            if (iteracion === total) this.finalizarHt(detalleTmp, errores);
          },
        });
    });
  }

  private parseHtScore(html: string): { home: number; away: number } | null {
    const inicio = html.indexOf('scoresByPeriod');
    const fin = html.indexOf('aggregateHomeScore');
    if (inicio < 0) return null;
    try {
      const texto = '{' + html.substring(inicio - 1, fin - 2) + '}';
      const detail = JSON.parse(texto);
      return {
        home: detail.scoresByPeriod[0].home.score,
        away: detail.scoresByPeriod[0].away.score,
      };
    } catch {
      return null;
    }
  }

  private finalizarHt(lista: Summary[], errores: number): void {
    lista.sort((a, b) => b.Date.getTime() - a.Date.getTime());

    let conteo = 0;
    const shortSums: number[] = [];
    let drawsHt = 0;

    lista.forEach((game) => {
      const shortSum = conteo;
      conteo = game.TLHtGoals === game.TVHtGoals ? 0 : conteo + 1;
      if (game.TLHtGoals === game.TVHtGoals) {
        shortSums.push(shortSum);
        drawsHt++;
      }
    });

    shortSums.push(conteo);
    this.ligaData.resultadosDetail.set(lista);
    this.ligaData.shortCountHt.set(shortSums);
    this.ligaData.totDrawHt.set(drawsHt);
    this.conteoActualHt.set(shortSums.length > 0 ? shortSums[0] : 0);
    this.errorCount.set(errores);
    this.mostrarResumen.set(true);
    this.procesando.set(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
