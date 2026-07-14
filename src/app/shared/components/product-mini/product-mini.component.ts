import { Component, Input, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-mini',
  templateUrl: './product-mini.component.html',
  styleUrls: ['./product-mini.component.css']
})
export class ProductMiniComponent implements OnChanges {
  @Input() imageUrl?: string | null;
  @Input() productName?: string | null;
  @Input() sku?: string | null;
  @Input() meta?: string | null;
  @Input() compact = false;

  readonly placeholderUrl = 'assets/images/placeholder.png';
  resolvedImageUrl = this.placeholderUrl;

  ngOnChanges(): void {
    this.resolvedImageUrl = this.resolveImageUrl(this.imageUrl);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.endsWith(this.placeholderUrl)) return;
    img.src = this.placeholderUrl;
  }

  private resolveImageUrl(url?: string | null): string {
    if (!url) return this.placeholderUrl;
    if (/^https?:\/\//i.test(url)) return url;
    const backendBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }
}
