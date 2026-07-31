import { Component, inject, computed, signal } from '@angular/core';
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

  showModal = signal(false);
  modalType = signal<'reverse' | 'ligas'>('reverse');

  reverseJson = computed(() => {
    const nombre = this.ligaData.nombrePublicoActual();
    const conteos = this.shortCountReverse();
    return JSON.stringify(
      { nombrePublico: nombre, temporadas: [{ temporada: 'Actual', conteos }] },
      null,
      2
    );
  });

  ligasJson = computed(() => {
    const nombre = this.ligaData.nombrePublicoActual();
    const resultados = [...this.ligaData.resultados()].reverse(); // cronológico
    const proximos = this.ligaData.proximos();

    const partidos = [
      ...resultados.map((r) => ({
        fechaHora: this.formatDate(r.Date),
        local: r.TLName,
        visitante: r.TVName,
        estado: 'Ended',
        resultado: { golesLocal: r.TLGoals, golesVisitante: r.TVGoals },
      })),
      ...proximos.map((p) => ({
        fechaHora: this.formatDate(p.Date),
        local: p.TLName,
        visitante: p.TVName,
        estado: 'Not started',
      })),
    ];

    return JSON.stringify(
      {
        descripcion: nombre,
        fuente: 'LiveScore API',
        temporadas: [
          {
            nombre: 'Actual',
            año: 'Actual',
            jornadas: [{ numero: 1, partidos }],
          },
        ],
      },
      null,
      2
    );
  });

  modalJson = computed(() =>
    this.modalType() === 'reverse' ? this.reverseJson() : this.ligasJson()
  );

  modalTitle = computed(() =>
    this.modalType() === 'reverse'
      ? `JSON Histórico — ${this.ligaData.nombrePublicoActual()}`
      : `JSON Ligas — ${this.ligaData.nombrePublicoActual()}`
  );

  openModal(type: 'reverse' | 'ligas' = 'reverse'): void {
    this.modalType.set(type);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  copyJson(): void {
    navigator.clipboard.writeText(this.modalJson());
  }

  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
}
