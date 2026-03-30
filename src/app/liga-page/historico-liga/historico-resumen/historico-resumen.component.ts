import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatsResult } from '../../../core/interfaces/results.interface';

@Component({
  selector: 'app-historico-resumen',
  imports: [DecimalPipe],
  templateUrl: './historico-resumen.component.html',
  styleUrl: './historico-resumen.component.scss',
})
export class HistoricoResumenComponent {
  @Input() statsGlobal!: StatsResult;
  @Input() pctRachaAlta: number = 0;
}
