import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'covid19rozaje.theme';

/**
 * Tema se pamti kao izbor korisnika, a "system" prati podešavanje uređaja.
 * Grafikoni ne mogu da čitaju CSS promjenljive kroz canvas, pa se pretplaćuju
 * na `changes$` i ponovo uzmu boje kad se tema promijeni.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly choice = new BehaviorSubject<ThemeChoice>(this.readStored());

  readonly choice$ = this.choice.asObservable();

  constructor() {
    this.apply(this.choice.value);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (this.choice.value === 'system') {
        this.choice.next('system');
      }
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onSystemChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(onSystemChange);
    }
  }

  /** Tema koja je stvarno na ekranu, nakon razrješenja "system". */
  get resolved(): 'light' | 'dark' {
    if (this.choice.value !== 'system') {
      return this.choice.value;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  set(choice: ThemeChoice): void {
    this.apply(choice);
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* privatni režim — izbor važi samo za ovu sesiju */
    }
    this.choice.next(choice);
  }

  toggle(): void {
    this.set(this.resolved === 'dark' ? 'light' : 'dark');
  }

  private apply(choice: ThemeChoice): void {
    const root = document.documentElement;
    if (choice === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', choice);
    }
  }

  private readStored(): ThemeChoice {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      /* nedostupan localStorage */
    }
    return 'system';
  }
}
