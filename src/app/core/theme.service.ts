import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'covid19rozaje.theme';

/**
 * The theme is remembered as the user's choice, while "system" follows the
 * device setting. Charts cannot read CSS variables through canvas, so they
 * subscribe to `changes$` and re-read the colours when the theme changes.
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

  /** The theme actually on screen, after resolving "system". */
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
      /* private mode — the choice only holds for this session */
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
      /* localStorage unavailable */
    }
    return 'system';
  }
}
