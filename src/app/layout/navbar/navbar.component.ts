import { Component, output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  menuToggle = output<void>();

  onMenuToggle() {
    this.menuToggle.emit();
  }
}
