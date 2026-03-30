import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LigasService, LigaHomologada } from '../../core/services/ligas.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  collapsed = input(false);

  ligasService = inject(LigasService);
  router = inject(Router);

  onSearch(event: Event) {
    this.ligasService.busqueda.set((event.target as HTMLInputElement).value);
  }

  clearSearch() {
    this.ligasService.busqueda.set('');
  }

  seleccionarLiga(liga: LigaHomologada) {
    this.ligasService.ligaSeleccionada.set(liga);
    this.router.navigate(['/liga']);
  }
}
