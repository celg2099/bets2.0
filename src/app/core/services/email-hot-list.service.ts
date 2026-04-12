import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../../environments/environment';
import { HotCheck, HistAcumRow } from '../interfaces/results.interface';
import { LigasService } from './ligas.service';

@Injectable({ providedIn: 'root' })
export class EmailHotListService {
  constructor(private ligasSvc: LigasService) {
    emailjs.init(environment.emailjs.publicKey);
  }

  private buildAmbosSet(): Set<string> {
    return new Set(
      this.ligasSvc.ligas
        .filter((l) => this.ligasSvc.tieneAmbosArchivos(l))
        .map((l) => l.nombrePublico)
    );
  }

  private ligaLabel(nombrePublico: string, ambosSet: Set<string>): string {
    const icon = ambosSet.has(nombrePublico)
      ? '<span style="color:#2e7d32; margin-right:4px;">&#9917;</span>'
      : '';
    return `${icon}${nombrePublico}`;
  }

  private parseDateNextGame(dateStr: string): Date {
    if (!dateStr) return new Date(0);
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, min, sec] = (timePart || '00:00:00').split(':');
    return new Date(+year, +month - 1, +day, +hour, +min, +sec);
  }

  private top2(rows: HistAcumRow[], col: keyof Pick<HistAcumRow, 'pctInmediato' | 'pctLeq3' | 'pctLeq5' | 'pctLeq7'>): [number, number] {
    const unique = [...new Set(rows.map((r) => r[col]))].sort((a, b) => b - a);
    return [unique[0] ?? -1, unique[1] ?? -2];
  }

  private cellBg(value: number, first: number, second: number): string {
    if (value === first) return ' background-color:#c8e6c9;';
    if (value === second) return ' background-color:#fff9c4;';
    return '';
  }

  private nextGameDateBg(dateStr: string): string {
    if (!dateStr) return '';
    const [datePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const gameDate = new Date(+year, +month - 1, +day);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (gameDate.getTime() === today.getTime()) return ' background-color:#fff176;';
    if (gameDate.getTime() === tomorrow.getTime()) return ' background-color:#ffcc80;';
    return '';
  }

  private calcModa(conteos: number[]): number {
    if (conteos.length === 0) return 0;
    const freq: Record<number, number> = {};
    conteos.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
    return Number(Object.entries(freq).sort((a, b) => +b[1] - +a[1])[0][0]);
  }

  buildResumenHotHtml(
    ligasHot: HotCheck[],
    historico: HistAcumRow[],
    todasLasLigas: HotCheck[],
    limitarAcumulado: boolean = false,
    includeModa: boolean = true
  ): string {
    const thStyle = 'padding:8px 12px; background:#2c3e50; color:#fff; text-align:left; font-size:13px;';
    const thCStyle = `${thStyle} text-align:center;`;
    const tableStyle = 'border-collapse:collapse; width:100%; font-family:Arial,sans-serif; font-size:13px;';
    const tdBase = 'padding:3px 12px;';
    const tdCenter = `${tdBase} text-align:center;`;
    const tdDate = `${tdBase} color:#555; white-space:nowrap;`;

    const fecha = new Date().toLocaleDateString('es-MX', { dateStyle: 'full' });
    const totalHot = ligasHot.length;
    const ambosSet = this.buildAmbosSet();

    // Ligas Principales: top 15 próximas a jugarse
    const top15 = [...todasLasLigas]
      .filter((l) => l.dateNextGame !== '')
      .sort(
        (a, b) =>
          this.parseDateNextGame(a.dateNextGame).getTime() -
          this.parseDateNextGame(b.dateNextGame).getTime()
      )
      .slice(0, 15);

    const ligasTop10Historico = new Set(
      [...historico]
        .sort((a, b) => b.pctInmediato - a.pctInmediato)
        .slice(0, 10)
        .map((h) => h.liga)
    );

    const filasPrincipales = top15
      .map((h) => {
        const moda = this.calcModa(h.lstConteo);
        const rowBg = ligasTop10Historico.has(h.liga) ? ' background-color:#e8f5e9;' : '';
        const dateBg = this.nextGameDateBg(h.dateNextGame);
        return `<tr style="${rowBg}">
          <td style="${tdBase}">${this.ligaLabel(h.pais, ambosSet)}</td>
          <td style="${tdCenter}">${h.conteoActual}</td>
          <td style="${tdCenter}">${h.maxConteo}</td>
          <td style="${tdCenter}">${h.gamesFinished}</td>
          ${includeModa ? `<td style="${tdCenter}">${moda}</td>` : ''}
          <td style="${tdCenter}">${h.percentDraw.toFixed(1)}%</td>
          <td style="${tdDate}${dateBg}">${h.dateNextGame}</td>
        </tr>`;
      })
      .join('');

    // Ligas con Máximo Conteo: top 15
    const filasMaxConteo = [...todasLasLigas]
      .filter((l) => l.conteoActual > 0 && l.dateNextGame !== '')
      .sort((a, b) => b.conteoActual - a.conteoActual)
      .slice(0, 15)
      .map((l) => {
        const moda = this.calcModa(l.lstConteo);
        const rowBg = ligasTop10Historico.has(l.liga) ? ' background-color:#e8f5e9;' : '';
        const dateBg = this.nextGameDateBg(l.dateNextGame);
        return `<tr style="${rowBg}">
          <td style="${tdBase}">${this.ligaLabel(l.pais, ambosSet)}</td>
          <td style="${tdCenter}">${l.conteoActual}</td>
          <td style="${tdCenter}">${l.maxConteo}</td>
          <td style="${tdCenter}">${l.gamesFinished}</td>
          ${includeModa ? `<td style="${tdCenter}">${moda}</td>` : ''}
          <td style="${tdCenter}">${l.percentDraw.toFixed(1)}%</td>
          <td style="${tdDate}${dateBg}">${l.dateNextGame}</td>
        </tr>`;
      })
      .join('');

    // Ligas HOT
    const filasHot = [...ligasHot]
      .sort(
        (a, b) =>
          this.parseDateNextGame(a.dateNextGame).getTime() -
          this.parseDateNextGame(b.dateNextGame).getTime()
      )
      .map((l) => {
        const moda = this.calcModa(l.lstConteo);
        const rachaColor = l.conteoActual === l.maxConteo ? '#c0392b' : '#2c3e50';
        const rowBg = ligasTop10Historico.has(l.liga) ? ' background-color:#e8f5e9;' : '';
        const dateBg = this.nextGameDateBg(l.dateNextGame);
        return `<tr style="${rowBg}">
          <td style="${tdBase}">${this.ligaLabel(l.pais, ambosSet)}</td>
          <td style="${tdCenter} font-weight:bold; color:${rachaColor};">${l.conteoActual}</td>
          <td style="${tdCenter}">${l.maxConteo}</td>
          <td style="${tdCenter}">${l.gamesFinished}</td>
          ${includeModa ? `<td style="${tdCenter}">${moda}</td>` : ''}
          <td style="${tdCenter}">${l.percentDraw.toFixed(1)}%</td>
          <td style="${tdDate}${dateBg}">${l.dateNextGame}</td>
        </tr>`;
      })
      .join('');

    // Histórico Acumulado
    const sortedHistorico = [...historico].sort((a, b) => b.pctInmediato - a.pctInmediato);
    const historicoRows = limitarAcumulado ? sortedHistorico.slice(0, 20) : sortedHistorico;
    const [t1Inm, t2Inm] = this.top2(sortedHistorico, 'pctInmediato');
    const [t1Leq3, t2Leq3] = this.top2(sortedHistorico, 'pctLeq3');
    const [t1Leq5, t2Leq5] = this.top2(sortedHistorico, 'pctLeq5');
    const [t1Leq7, t2Leq7] = this.top2(sortedHistorico, 'pctLeq7');

    const filasHistorico = historicoRows
      .map(
        (h) => `<tr>
        <td style="${tdBase}">${this.ligaLabel(h.pais, ambosSet)}</td>
        <td style="${tdCenter}${this.cellBg(h.pctInmediato, t1Inm, t2Inm)}">${h.pctInmediato}%</td>
        <td style="${tdCenter}${this.cellBg(h.pctLeq3, t1Leq3, t2Leq3)}">${h.pctLeq3}%</td>
        <td style="${tdCenter}${this.cellBg(h.pctLeq5, t1Leq5, t2Leq5)}">${h.pctLeq5}%</td>
        <td style="${tdCenter}${this.cellBg(h.pctLeq7, t1Leq7, t2Leq7)}">${h.pctLeq7}%</td>
      </tr>`
      )
      .join('');

    return `
<div style="font-family:Arial,sans-serif; max-width:750px; margin:0 auto; color:#2c3e50;">

  <div style="background:#2c3e50; padding:16px 20px; border-radius:6px 6px 0 0;">
    <h2 style="margin:0; color:#fff; font-size:18px;">&#9917; BetsApp &mdash; Reporte HOT</h2>
    <p style="margin:4px 0 0; color:#bdc3c7; font-size:13px;">${fecha}</p>
  </div>

  <div style="padding:8px 20px 12px; background:#fff; border:1px solid #e0e0e0;">

    <h3 style="margin:0 0 4px; font-size:15px; color:#1a5276;">&#11088; Ligas Principales (Pr&oacute;ximas a Jugarse)</h3>
    <table style="${tableStyle}">
      <thead><tr>
        <th style="${thStyle}">Pa&iacute;s</th>
        <th style="${thCStyle}">Conteo Actual</th>
        <th style="${thCStyle}">M&aacute;x Conteo</th>
        <th style="${thCStyle}">Juegos</th>
        ${includeModa ? `<th style="${thCStyle}">Moda</th>` : ''}
        <th style="${thCStyle}">% Empates</th>
        <th style="${thStyle}">Pr&oacute;ximo Partido</th>
      </tr></thead>
      <tbody>${filasPrincipales}</tbody>
    </table>

    <h3 style="margin:10px 0 4px; font-size:15px; color:#6a1b9a;">&#128200; Ligas con M&aacute;ximo Conteo</h3>
    <table style="${tableStyle}">
      <thead><tr>
        <th style="${thStyle}">Pa&iacute;s</th>
        <th style="${thCStyle}">Conteo Actual</th>
        <th style="${thCStyle}">M&aacute;x Conteo</th>
        <th style="${thCStyle}">Juegos</th>
        ${includeModa ? `<th style="${thCStyle}">Moda</th>` : ''}
        <th style="${thCStyle}">% Empates</th>
        <th style="${thStyle}">Pr&oacute;ximo Partido</th>
      </tr></thead>
      <tbody>${filasMaxConteo}</tbody>
    </table>

    <h3 style="margin:10px 0 4px; font-size:15px; color:#c0392b;">&#128293; Ligas HOT (${totalHot})</h3>
    <table style="${tableStyle}">
      <thead><tr>
        <th style="${thStyle}">Pa&iacute;s</th>
        <th style="${thCStyle}">Conteo Actual</th>
        <th style="${thCStyle}">M&aacute;x Conteo</th>
        <th style="${thCStyle}">Juegos</th>
        ${includeModa ? `<th style="${thCStyle}">Moda</th>` : ''}
        <th style="${thCStyle}">% Empates</th>
        <th style="${thStyle}">Pr&oacute;ximo Partido</th>
      </tr></thead>
      <tbody>${filasHot}</tbody>
    </table>

    <h3 style="margin:10px 0 4px; font-size:15px; color:#2980b9;">&#128202; Hist&oacute;rico Acumulado${limitarAcumulado ? ' (Top 20)' : ''}</h3>
    <table style="${tableStyle}">
      <thead><tr>
        <th style="${thStyle}">Pa&iacute;s</th>
        <th style="${thCStyle}">Inm.</th>
        <th style="${thCStyle}">&le; 3</th>
        <th style="${thCStyle}">&le; 5</th>
        <th style="${thCStyle}">&le; 7</th>
      </tr></thead>
      <tbody>${filasHistorico}</tbody>
    </table>

  </div>

  <div style="padding:10px 20px; background:#f5f5f5; border:1px solid #e0e0e0; border-top:none;
              border-radius:0 0 6px 6px; font-size:11px; color:#999; text-align:center;">
    Generado autom&aacute;ticamente por BetsApp
  </div>

</div>`;
  }

  enviar(
    ligasHot: HotCheck[],
    historico: HistAcumRow[],
    todasLasLigas: HotCheck[],
    limitarAcumulado: boolean
  ): Promise<void> {
    const html_content = this.buildResumenHotHtml(ligasHot, historico, todasLasLigas, limitarAcumulado);
    return emailjs
      .send(environment.emailjs.serviceId, environment.emailjs.templateId, { html_content })
      .then(() => undefined);
  }
}
