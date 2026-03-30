import { Component, Input, OnChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { TemporadaHistorica } from '../../../core/interfaces/results.interface';

@Component({
  selector: 'app-historico-tabla',
  imports: [NgClass],
  templateUrl: './historico-tabla.component.html',
  styleUrl: './historico-tabla.component.scss',
})
export class HistoricoTablaComponent implements OnChanges {
  readonly UMBRAL_AMARILLO_MIN = 9;
  readonly UMBRAL_AMARILLO_MAX = 11;
  readonly UMBRAL_ROJO = 12;

  @Input() temporadas: TemporadaHistorica[] = [];
  @Input() nombrePublico: string = '';

  columnas: number[] = [];

  ngOnChanges(): void {
    const max = Math.max(...this.temporadas.map((t) => t.conteos.length), 0);
    this.columnas = Array.from({ length: max }, (_, i) => i);
  }

  getCelda(temporada: TemporadaHistorica, idx: number): number | null {
    return idx < temporada.conteos.length ? temporada.conteos[idx] : null;
  }

  getCeldaClase(temporada: TemporadaHistorica, idx: number): string {
    const val = this.getCelda(temporada, idx);
    if (val === null) return '';
    if (val >= this.UMBRAL_ROJO) return 'celda-max';
    if (val >= this.UMBRAL_AMARILLO_MIN && val <= this.UMBRAL_AMARILLO_MAX) return 'celda-alta';
    return '';
  }
}
