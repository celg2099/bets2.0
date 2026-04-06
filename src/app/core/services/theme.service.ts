import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    this.isDark.set(dark);
    this.applyTheme(dark);

    effect(() => {
      this.applyTheme(this.isDark());
    });
  }

  toggle() {
    this.isDark.update((v) => !v);
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  private applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
