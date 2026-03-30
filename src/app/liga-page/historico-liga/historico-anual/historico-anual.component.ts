import { Component, Input } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { StatsResult } from '../../../core/interfaces/results.interface';

@Component({
  selector: 'app-historico-anual',
  imports: [DecimalPipe, NgClass],
  templateUrl: './historico-anual.component.html',
  styleUrl: './historico-anual.component.scss',
})
export class HistoricoAnualComponent {
  @Input() statsAnual: Array<{ temporada: string; s: StatsResult }> = [];
  @Input() maxAvgAnual: number = 1;
  @Input() maxMaxAnual: number = 1;
}
