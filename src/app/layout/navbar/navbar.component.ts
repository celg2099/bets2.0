import { Component, computed, inject, output } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { LigasService } from '../../core/services/ligas.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  menuToggle = output<void>();
  themeSvc = inject(ThemeService);
  private ligasSvc = inject(LigasService);

  readonly sofascoreCount = computed(() =>
    this.ligasSvc.ligas.filter(l => l.enable === 1 && !!l.sofascoreId).length
  );
  readonly livescoreCount = computed(() =>
    this.ligasSvc.ligas.filter(l => l.enable === 1 && !l.sofascoreId).length
  );

  onMenuToggle() {
    this.menuToggle.emit();
  }
}
