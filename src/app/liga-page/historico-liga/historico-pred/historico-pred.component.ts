import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-historico-pred',
  imports: [DecimalPipe],
  templateUrl: './historico-pred.component.html',
  styleUrl: './historico-pred.component.scss',
})
export class HistoricoPredComponent {
  @Input() probEmpate: Array<{ x: number; exacta: number; acum: number }> = [];
  @Input() maxProbExacta: number = 1;
  @Input() mediana: number = 0;
}
