import { Component, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LigaDataService } from '../../core/services/liga-data.service';

@Component({
  selector: 'app-proximos-juegos',
  imports: [DatePipe],
  templateUrl: './proximos-juegos.component.html',
  styleUrl: './proximos-juegos.component.scss',
})
export class ProximosJuegosComponent {
  ligaData = inject(LigaDataService);
  proximos = computed(() => this.ligaData.proximos());

  esHoy(date: Date): boolean {
    const hoy = new Date();
    return (
      date.getFullYear() === hoy.getFullYear() &&
      date.getMonth() === hoy.getMonth() &&
      date.getDate() === hoy.getDate()
    );
  }
}
