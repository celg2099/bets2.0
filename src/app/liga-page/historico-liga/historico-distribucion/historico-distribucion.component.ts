import { Component, Input } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { StatsResult } from '../../../core/interfaces/results.interface';

@Component({
  selector: 'app-historico-distribucion',
  imports: [DecimalPipe, NgClass],
  templateUrl: './historico-distribucion.component.html',
  styleUrl: './historico-distribucion.component.scss',
})
export class HistoricoDistribucionComponent {
  @Input() frecuencias: Array<{ val: number; count: number; pct: number }> = [];
  @Input() percentiles: Array<{ label: string; value: number }> = [];
  @Input() statsGlobal!: StatsResult;
  @Input() maxFrecuencia: number = 1;
  @Input() maxPercentil: number = 1;

  getFreqColor(val: number): string {
    if (val === 0) return 'verde';
    if (val >= 15) return 'rojo';
    if (val >= 9) return 'ambar';
    return 'azul';
  }
}
