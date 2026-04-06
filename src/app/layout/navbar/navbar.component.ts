import { Component, inject, output } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  menuToggle = output<void>();
  themeSvc = inject(ThemeService);

  onMenuToggle() {
    this.menuToggle.emit();
  }
}
