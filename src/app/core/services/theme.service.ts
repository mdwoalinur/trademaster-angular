import { Injectable } from '@angular/core';

export type AppTheme = 'light' | 'dark' | 'blue' | 'green' | 'purple';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'trademaster-theme';
  private readonly supportedThemes: AppTheme[] = ['light', 'dark', 'blue', 'green', 'purple'];

  constructor() {
    this.loadSavedTheme();
  }

  loadSavedTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey) as AppTheme | null;
    this.switchTheme(this.isSupportedTheme(savedTheme) ? savedTheme : 'light');
  }

  switchTheme(theme: AppTheme): void {
    const nextTheme = this.isSupportedTheme(theme) ? theme : 'light';
    localStorage.setItem(this.storageKey, nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  }

  getCurrentTheme(): AppTheme {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    return this.isSupportedTheme(currentTheme) ? currentTheme : 'light';
  }

  private isSupportedTheme(theme: string | null): theme is AppTheme {
    return theme === 'light' || theme === 'dark' || theme === 'blue' || theme === 'green' || theme === 'purple';
  }
}
