import { Component } from '@angular/core';

import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly year = new Date().getFullYear();

  constructor(public theme: ThemeService) {}

  get isDark(): boolean {
    return this.theme.resolved === 'dark';
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
