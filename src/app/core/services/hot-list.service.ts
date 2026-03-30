import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, from, mergeMap, toArray, catchError, of, map } from 'rxjs';
import {
  Liga,
  EpsStatus,
  Event,
  BdTempHistorica,
  HotCheck,
  HistAcumRow,
} from '../interfaces/results.interface';
import { LigasService, LigaHomologada } from './ligas.service';

@Injectable({ providedIn: 'root' })
export class HotListService {
  private readonly servicioUrl = '/v1/api/app/stage/soccer/';

  loading = signal(false);
  progreso = signal(0);
  total = signal(0);
  lista = signal<HotCheck[]>([]);
  listaHot = signal<HotCheck[]>([]);
  listaHistorico = signal<HistAcumRow[]>([]);

  constructor(private http: HttpClient, private ligasService: LigasService) {}

  generarLista(): void {
    this.loading.set(true);
    this.progreso.set(0);
    this.lista.set([]);
    this.listaHot.set([]);
    this.listaHistorico.set([]);

    const ligas = [...this.ligasService.ligas].sort((a, b) =>
      a.nombrePublico.localeCompare(b.nombrePublico)
    );
    this.total.set(ligas.length);

    from(ligas)
      .pipe(
        mergeMap((liga) => this.procesarLiga(liga), 5),
        toArray()
      )
      .subscribe({
        next: (results) => {
          const tmpLista: HotCheck[] = [];
          const tmpHistorico: HistAcumRow[] = [];

          results.forEach((r) => {
            if (r) {
              tmpLista.push(r.hotCheck);
              if (r.histAcum) tmpHistorico.push(r.histAcum);
            }
          });

          this.lista.set(tmpLista);
          this.listaHot.set(
            tmpLista.filter(
              (e) => e.conteoActual >= e.maxConteo - 2 && e.dateNextGame !== ''
            )
          );
          this.listaHistorico.set(tmpHistorico);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private procesarLiga(liga: LigaHomologada) {
    const params = new HttpParams().set('MD', '1');

    return forkJoin({
      resp: this.http
        .get<Liga>(`${this.servicioUrl}${liga.nombreForApi}-6`, { params })
        .pipe(catchError(() => of(null))),
      bd: this.http
        .get<BdTempHistorica>(`/historico/${liga.nombrePublico}.json`)
        .pipe(catchError(() => of(null))),
    }).pipe(
      map(({ resp, bd }) => {
        this.progreso.update((v) => v + 1);
        if (!resp) return null;

        const eventos = resp.Stages[0]?.Events ?? [];
        const hotCheck = this.buildHotCheck(liga, eventos);
        const histAcum = bd
          ? this.buildHistAcum(liga, hotCheck.lstConteo, bd)
          : null;

        return { hotCheck, histAcum };
      })
    );
  }

  private buildHotCheck(liga: LigaHomologada, eventos: Event[]): HotCheck {
    const finalizados = eventos.filter((e) => e.Eps === EpsStatus.Ft);
    let conteo = 0;
    const shortSums: number[] = [];
    let draws = 0;

    finalizados.forEach((e) => {
      const g1 = Number(e.Tr1 ?? -1);
      const g2 = Number(e.Tr2 ?? -1);
      const shortSum = conteo;
      conteo = g1 === g2 ? 0 : conteo + 1;
      if (g1 === g2) {
        shortSums.push(shortSum);
        draws++;
      }
    });

    shortSums.push(conteo);
    shortSums.reverse();

    const nextGame = eventos.find((e) => e.Eps === EpsStatus.NS);
    const dateNextGame = nextGame
      ? this.getDateFormat(nextGame.Esd.toString())
      : '';

    const maxConteo = shortSums.length > 0 ? Math.max(...shortSums) : 0;
    const percentDraw =
      finalizados.length > 0 ? (draws / finalizados.length) * 100 : 0;

    return {
      pais: liga.nombrePublico,
      liga: liga.nombreForApi,
      conteoActual: shortSums.length > 0 ? shortSums[0] : 0,
      maxConteo,
      gamesFinished: finalizados.length,
      totDraw: draws,
      lstConteo: shortSums,
      dateNextGame,
      percentDraw,
    };
  }

  private buildHistAcum(
    liga: LigaHomologada,
    conteosActuales: number[],
    bd: BdTempHistorica
  ): HistAcumRow {
    const historicConteos = bd.temporadas.flatMap((t) => t.conteos);
    const allConteos = [...historicConteos, ...conteosActuales];
    const n = allConteos.length;
    if (n === 0) {
      return {
        pais: liga.nombrePublico,
        liga: liga.nombreForApi,
        pctInmediato: 0,
        pctLeq3: 0,
        pctLeq5: 0,
        pctLeq7: 0,
      };
    }

    return {
      pais: liga.nombrePublico,
      liga: liga.nombreForApi,
      pctInmediato: +(
        (allConteos.filter((v) => v === 0).length / n) *
        100
      ).toFixed(1),
      pctLeq3: +(
        (allConteos.filter((v) => v <= 3).length / n) *
        100
      ).toFixed(1),
      pctLeq5: +(
        (allConteos.filter((v) => v <= 5).length / n) *
        100
      ).toFixed(1),
      pctLeq7: +(
        (allConteos.filter((v) => v <= 7).length / n) *
        100
      ).toFixed(1),
    };
  }

  private getDateFormat(dateStr: string): string {
    if (dateStr.length < 14) return '';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const min = dateStr.substring(10, 12);
    const seg = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${min}:${seg}`;
  }
}
