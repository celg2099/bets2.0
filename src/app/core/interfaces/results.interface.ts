export interface Liga {
  Stages: Stage[];
}

export interface Stage {
  Sid: string;
  Snm: string;
  Scd: string;
  Cid: string;
  Cnm: string;
  Csnm: string;
  Ccd: string;
  Ccdiso: string;
  CompId: string;
  CompN: string;
  Events?: Event[];
}

export interface Event {
  Eid: string;
  Tr1?: string;
  Tr2?: string;
  Trh1?: string;
  Trh2?: string;
  T1: T1[];
  T2: T1[];
  Eps: EpsStatus;
  Esd: number;
  [key: string]: any;
}

export interface T1 {
  Nm: string;
  ID: string;
  Img: string;
  [key: string]: any;
}

export enum EpsStatus {
  Ft = 'FT',
  NS = 'NS',
  Postp = 'Postp.',
}

export interface Summary {
  Eid?: string;
  TLName: string;
  TVName: string;
  TLGoals: number;
  TVGoals: number;
  TLHtGoals?: number;
  TVHtGoals?: number;
  CurrentCount: number;
  Date: Date;
}

export interface ListStatics {
  valor: number;
  info: number;
}

export interface TemporadaHistorica {
  temporada: string;
  conteos: number[];
}

export interface BdTempHistorica {
  nombrePublico: string;
  temporadas: TemporadaHistorica[];
}

export interface HotCheck {
  pais: string;
  liga: string;
  conteoActual: number;
  maxConteo: number;
  gamesFinished: number;
  totDraw: number;
  lstConteo: number[];
  dateNextGame: string;
  percentDraw: number;
}

export interface HistAcumRow {
  pais: string;
  liga: string;
  pctInmediato: number;
  pctLeq3: number;
  pctLeq5: number;
  pctLeq7: number;
}

export interface StatsResult {
  n: number;
  avg: number;
  median: number;
  max: number;
  zeros: number;
  moda: number;
  std: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}
