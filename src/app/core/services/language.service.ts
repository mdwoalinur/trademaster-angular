import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'bn';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'trademaster-language';
  private readonly supportedLanguages: AppLanguage[] = ['en', 'bn'];

  constructor(private translate: TranslateService) {
    this.translate.addLangs(this.supportedLanguages);
    this.translate.setDefaultLang('en');
    this.loadSavedLanguage();
  }

  loadSavedLanguage(): void {
    const savedLanguage = localStorage.getItem(this.storageKey) as AppLanguage | null;
    this.switchLanguage(this.isSupportedLanguage(savedLanguage) ? savedLanguage : 'en');
  }

  switchLanguage(lang: AppLanguage): void {
    const nextLanguage = this.isSupportedLanguage(lang) ? lang : 'en';
    localStorage.setItem(this.storageKey, nextLanguage);
    this.translate.use(nextLanguage);
    document.documentElement.lang = nextLanguage;
  }

  getCurrentLanguage(): AppLanguage {
    const current = this.translate.currentLang as AppLanguage;
    return this.isSupportedLanguage(current) ? current : 'en';
  }

  private isSupportedLanguage(lang: string | null): lang is AppLanguage {
    return lang === 'en' || lang === 'bn';
  }
}
