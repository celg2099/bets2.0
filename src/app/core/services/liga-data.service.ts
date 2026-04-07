import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Liga,
  Event,
  EpsStatus,
  Summary,
  BdTempHistorica,
  TemporadaHistorica,
} from '../interfaces/results.interface';

@Injectable({ providedIn: 'root' })
export class LigaDataService {
  private readonly servicioUrl = '/v1/api/app/stage/soccer/';

  loading = signal(false);
  resultados = signal<Summary[]>([]);
  proximos = signal<Summary[]>([]);
  shortCount = signal<number[]>([]);
  conteoActual = signal(0);
  totDraw = signal(0);
  ligaActual = signal('');
  nombrePublicoActual = signal('');

  temporadaActual = signal<TemporadaHistorica | null>(null);

  constructor(private http: HttpClient) {}

  buscarResultados(query: string): void {
    this.loading.set(true);

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
            this.setResultados(eventos, query);
          } else {
            this.loading.set(false);
          }
        },
        error: (err) => {
          console.error('[LigaDataService] Error al cargar liga:', query, err);
          this.loading.set(false);
        },
      });
  }

  private setResultados(eventos: Event[], query: string): void {
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
    this.ligaActual.set(query);
    this.conteoActual.set(shortSums.length > 0 ? shortSums[0] : 0);
    this.temporadaActual.set({
      temporada: 'Actual',
      conteos: [...shortSums].reverse(),
    });
    this.loading.set(false);
  }

  private setProximosEventos(eventos: Event[]): void {
    const proxList = eventos
      .filter((e) => e.Eps === EpsStatus.NS)
      .map((e) => this.buildSummary(e));
    this.proximos.set(proxList);
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
