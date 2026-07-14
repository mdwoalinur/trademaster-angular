import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'statusLabel',
  pure: false
})
export class StatusLabelPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: string | null | undefined): string {
    if (value == null || value === '') return '-';
    const normalized = String(value).trim().toUpperCase();
    const translated = this.translate.instant(`STATUS.${normalized}`);
    if (translated && translated !== `STATUS.${normalized}`) {
      return translated;
    }
    return normalized
      .toLowerCase()
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
