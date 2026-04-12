import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, concatMap, forkJoin, map } from 'rxjs';
import {
  Liga,
  Event,
  EpsStatus,
  Summary,
  BdTempHistorica,
  TemporadaHistorica,
  SofascoreEvent,
  SofascoreSeasonsResponse,
  SofascoreRoundsResponse,
  SofascoreEventsResponse,
} from '../interfaces/results.interface';
import { LigasService } from './ligas.service';

@Injectable({ providedIn: 'root' })
export class LigaDataService {
  private readonly servicioUrl = '/v1/api/app/stage/soccer/';
  private readonly sofascoreUrl = '/sofascore-api';

  loading = signal(false);
  apiError = signal(false);
  resultados = signal<Summary[]>([]);
  proximos = signal<Summary[]>([]);
  shortCount = signal<number[]>([]);
  conteoActual = signal(0);
  totDraw = signal(0);
  ligaActual = signal('');
  nombrePublicoActual = signal('');

  temporadaActual = signal<TemporadaHistorica | null>(null);

  constructor(private http: HttpClient, private ligasService: LigasService) {}

  buscarResultados(query: string): void {
    this.loading.set(true);
    this.apiError.set(false);
    this.ligaActual.set(query);

    const liga = this.ligasService.ligas.find((l) => l.nombreForApi === query);
    if (liga?.sofascoreId) {
      this.buscarResultadosSofascore(liga.sofascoreId);
      return;
    }

    const params = new HttpParams().set('MD', '1');

    this.http
      .get<Liga>(`${this.servicioUrl}${query}-6`, { params })
      .subscribe({
        next: (resp) => {
          console.log('[LigaDataService] Respuesta API:', query, resp);
          this.resultados.set([]);
          this.proximos.set([]);
          this.shortCount.set([]);
          this.totDraw.set(0);

          if (resp.Stages.length > 0 && resp.Stages[0].Events) {
            const eventos = resp.Stages[0].Events;
            this.setProximosEventos([...eventos]);
            this.setResultados(eventos);
          } else {
            this.loading.set(false);
          }
        },
        error: (err) => {
          console.error('[LigaDataService] Error al cargar liga:', query, err);
          this.apiError.set(true);
          this.loading.set(false);
        },
      });
  }

  private buscarResultadosSofascore(tournamentId: number): void {
    this.http
      .get<SofascoreSeasonsResponse>(
        `${this.sofascoreUrl}/unique-tournament/${tournamentId}/seasons`
      )
      .pipe(
        concatMap((seasonsResp) => {
          const seasonId = seasonsResp.seasons[0].id;
          return this.http
            .get<SofascoreRoundsResponse>(
              `${this.sofascoreUrl}/unique-tournament/${tournamentId}/season/${seasonId}/rounds`
            )
            .pipe(
              concatMap((roundsResp) => {
                const currentRound =
                  roundsResp.currentRound?.round ?? roundsResp.rounds.length;
                const requests = Array.from(
                  { length: currentRound },
                  (_, i) =>
                    this.http.get<SofascoreEventsResponse>(
                      `${this.sofascoreUrl}/unique-tournament/${tournamentId}/season/${seasonId}/events/round/${i + 1}`
                    )
                );
                return forkJoin(requests).pipe(
                  map((responses) =>
                    responses.flatMap((r) => r.events ?? [])
                  )
                );
              })
            );
        })
      )
      .subscribe({
        next: (allEvents) => {
          console.log('[LigaDataService] Sofascore events:', allEvents.length);
          this.resultados.set([]);
          this.proximos.set([]);
          this.shortCount.set([]);
          this.totDraw.set(0);

          if (allEvents.length > 0) {
            this.setProximosSofascore(allEvents);
            this.setResultadosSofascore(allEvents);
          } else {
            this.loading.set(false);
          }
        },
        error: (err) => {
          console.error('[LigaDataService] Sofascore error:', err);
          this.apiError.set(true);
          this.loading.set(false);
        },
      });
  }

  private setResultadosSofascore(events: SofascoreEvent[]): void {
    const finalizados = events
      .filter((e) => e.status.type === 'finished')
      .sort((a, b) => a.startTimestamp - b.startTimestamp);

    let conteo = 0;
    const shortSums: number[] = [];
    let draws = 0;
    const resultadosList: Summary[] = [];

    for (const e of finalizados) {
      const gl = e.homeScore?.current ?? -1;
      const gv = e.awayScore?.current ?? -1;
      const shortSum = conteo;
      conteo = gl === gv ? 0 : conteo + 1;

      if (gl === gv) {
        shortSums.push(shortSum);
        draws++;
      }

      resultadosList.push({
        TLName: e.homeTeam.name,
        TVName: e.awayTeam.name,
        TLGoals: gl,
        TVGoals: gv,
        CurrentCount: conteo,
        Date: new Date(e.startTimestamp * 1000),
      });
    }

    shortSums.push(conteo);
    resultadosList.reverse();
    shortSums.reverse();

    this.resultados.set(resultadosList);
    this.shortCount.set(shortSums);
    this.totDraw.set(draws);
    this.conteoActual.set(shortSums.length > 0 ? shortSums[0] : 0);
    this.temporadaActual.set({
      temporada: 'Actual',
      conteos: [...shortSums].reverse(),
    });
    this.loading.set(false);
  }

  private setProximosSofascore(events: SofascoreEvent[]): void {
    const ahora = Date.now();
    const proxList = events
      .filter(
        (e) =>
          e.status.type === 'notstarted' && e.startTimestamp * 1000 >= ahora
      )
      .sort((a, b) => a.startTimestamp - b.startTimestamp)
      .map((e) => ({
        TLName: e.homeTeam.name,
        TVName: e.awayTeam.name,
        TLGoals: -1,
        TVGoals: -1,
        CurrentCount: -1,
        Date: new Date(e.startTimestamp * 1000),
      }));
    this.proximos.set(proxList);
  }

  private setResultados(eventos: Event[]): void {
    const finalizados = eventos.filter((e) => e.Eps === EpsStatus.Ft);

    let conteo = 0;
    let shortSums: number[] = [];
    let draws = 0;
    const resultadosList: Summary[] = [];

    finalizados.forEach((e) => {
      const item = this.buildSummary(e);
      const shortSum = conteo;
      conteo = item.TLGoals === item.TVGoals ? 0 : conteo + 1;

      if (item.TLGoals === item.TVGoals) {
        shortSums.push(shortSum);
        draws++;
      }

      item.CurrentCount = conteo;
      item.Eid = e.Eid;
      resultadosList.push(item);
    });

    shortSums.push(conteo);
    resultadosList.reverse();
    shortSums.reverse();

    this.resultados.set(resultadosList);
    this.shortCount.set(shortSums);
    this.totDraw.set(draws);
    this.conteoActual.set(shortSums.length > 0 ? shortSums[0] : 0);
    this.temporadaActual.set({
      temporada: 'Actual',
      conteos: [...shortSums].reverse(),
    });
    this.loading.set(false);
  }

  private setProximosEventos(eventos: Event[]): void {
    const ahora = Date.now();
    const proxList = eventos
      .filter((e) => e.Eps === EpsStatus.NS && this.esdToTimestamp(e.Esd) >= ahora)
      .map((e) => this.buildSummary(e));
    this.proximos.set(proxList);
  }

  private esdToTimestamp(esd: number): number {
    const s = String(esd);
    return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12)).getTime();
  }

  private buildSummary(e: Event): Summary {
    const x = new Date(this.getDateFormat(e.Esd.toString()));
    return {
      TLName: e.T1[0].Nm,
      TVName: e.T2[0].Nm,
      TLGoals: Number(e.Tr1 ?? -1),
      TVGoals: Number(e.Tr2 ?? -1),
      CurrentCount: -1,
      Date: x,
    };
  }

  private getDateFormat(dateStr: string): string {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const min = dateStr.substring(10, 12);
    const seg = dateStr.substring(12, 14);
    return `${month}/${day}/${year} ${hour}:${min}:${seg}`;
  }

  getHistoricoLiga(nombrePublico: string): Observable<BdTempHistorica> {
    console.log('[Historico] Buscando:', nombrePublico);
    return this.http.get<BdTempHistorica>(`/historico/${nombrePublico}.json`);
  }
}
