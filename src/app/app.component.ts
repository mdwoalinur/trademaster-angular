import { Component } from '@angular/core';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'trademaster-ng';

  constructor(
    private languageService: LanguageService,
    private themeService: ThemeService
  ) {}
}
