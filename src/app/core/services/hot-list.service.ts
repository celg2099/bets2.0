import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, from, mergeMap, toArray, catchError, of, map, concatMap, delay, reduce } from 'rxjs';
import {
  Liga,
  EpsStatus,
  Event,
  BdTempHistorica,
  HotCheck,
  HistAcumRow,
  SofascoreEvent,
  SofascoreSeasonsResponse,
  SofascoreRoundsResponse,
  SofascoreEventsResponse,
} from '../interfaces/results.interface';
import { LigasService, LigaHomologada } from './ligas.service';

@Injectable({ providedIn: 'root' })
export class HotListService {
  private readonly servicioUrl = '/v1/api/app/stage/soccer/';
  private readonly sofascoreUrl = '/sofascore-api';

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
    if (liga.sofascoreId) {
      return this.procesarLigaSofascore(liga);
    }

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

  private procesarLigaSofascore(liga: LigaHomologada) {
    const id = liga.sofascoreId!;

    return this.http
      .get<SofascoreSeasonsResponse>(
        `${this.sofascoreUrl}/unique-tournament/${id}/seasons`
      )
      .pipe(
        concatMap((seasonsResp) => {
          const seasonId = seasonsResp.seasons[0].id;
          return this.http
            .get<SofascoreRoundsResponse>(
              `${this.sofascoreUrl}/unique-tournament/${id}/season/${seasonId}/rounds`
            )
            .pipe(
              concatMap((roundsResp) => {
                const currentRound =
                  roundsResp.currentRound?.round ?? roundsResp.rounds.length;
                const roundNumbers = Array.from(
                  { length: currentRound },
                  (_, i) => i + 1
                );
                return from(roundNumbers).pipe(
                  concatMap((n) =>
                    of(n).pipe(
                      delay(200),
                      concatMap(() =>
                        this.http.get<SofascoreEventsResponse>(
                          `${this.sofascoreUrl}/unique-tournament/${id}/season/${seasonId}/events/round/${n}`
                        )
                      )
                    )
                  ),
                  reduce(
                    (acc: SofascoreEvent[], resp: SofascoreEventsResponse) =>
                      acc.concat(resp.events ?? []),
                    []
                  )
                );
              })
            );
        }),
        concatMap((allEvents) =>
          this.http
            .get<BdTempHistorica>(`/historico/${liga.nombrePublico}.json`)
            .pipe(
              catchError(() => of(null)),
              map((bd) => {
                this.progreso.update((v) => v + 1);
                const hotCheck = this.buildHotCheckSofascore(liga, allEvents);
                const histAcum = bd
                  ? this.buildHistAcum(liga, hotCheck.lstConteo, bd)
                  : null;
                return { hotCheck, histAcum };
              })
            )
        ),
        catchError(() => {
          this.progreso.update((v) => v + 1);
          return of(null);
        })
      );
  }

  private buildHotCheckSofascore(
    liga: LigaHomologada,
    events: SofascoreEvent[]
  ): HotCheck {
    const finalizados = events
      .filter((e) => e.status.type === 'finished')
      .sort((a, b) => a.startTimestamp - b.startTimestamp);

    let conteo = 0;
    const shortSums: number[] = [];
    let draws = 0;

    for (const e of finalizados) {
      const g1 = e.homeScore?.current ?? -1;
      const g2 = e.awayScore?.current ?? -1;
      const shortSum = conteo;
      conteo = g1 === g2 ? 0 : conteo + 1;
      if (g1 === g2) {
        shortSums.push(shortSum);
        draws++;
      }
    }
    shortSums.push(conteo);
    shortSums.reverse();

    const ahora = Date.now();
    const nextGame = events
      .filter(
        (e) =>
          e.status.type === 'notstarted' && e.startTimestamp * 1000 >= ahora
      )
      .sort((a, b) => a.startTimestamp - b.startTimestamp)[0];

    const dateNextGame = nextGame
      ? this.timestampToDateStr(nextGame.startTimestamp)
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

  private timestampToDateStr(ts: number): string {
    const d = new Date(ts * 1000);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    const seg = String(d.getUTCSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${seg}`;
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

    const ahora = Date.now();
    const nextGame = eventos.find(
      (e) => e.Eps === EpsStatus.NS && this.esdToTimestamp(e.Esd) >= ahora
    );
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

  private esdToTimestamp(esd: number): number {
    const s = String(esd);
    return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12)).getTime();
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
