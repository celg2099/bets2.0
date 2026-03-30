import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);

  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }
}
