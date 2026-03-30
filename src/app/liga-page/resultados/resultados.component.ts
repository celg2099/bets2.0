import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LigaDataService } from '../../core/services/liga-data.service';

@Component({
  selector: 'app-resultados',
  imports: [DatePipe],
  templateUrl: './resultados.component.html',
  styleUrl: './resultados.component.scss',
})
export class ResultadosComponent {
  ligaData = inject(LigaDataService);

  resultados = computed(() => this.ligaData.resultados());
  shortCount = computed(() => this.ligaData.shortCount());
  shortCountReverse = computed(() => [...this.ligaData.shortCount()].reverse());
}
