import { Component, Input, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-mini',
  templateUrl: './customer-mini.component.html',
  styleUrls: ['./customer-mini.component.css']
})
export class CustomerMiniComponent implements OnChanges {
  @Input() photoUrl?: string | null;
  @Input() customerPhotoUrl?: string | null;
  @Input() customer?: { photoUrl?: string | null; customerPhotoUrl?: string | null; imageUrl?: string | null } | null;
  @Input() customerName?: string | null;
  @Input() customerCode?: string | null;
  @Input() email?: string | null;
  @Input() phone?: string | null;
  @Input() compact = false;

  resolvedPhotoUrl = '';
  initials = 'C';

  ngOnChanges(): void {
    this.resolvedPhotoUrl = this.resolvePhotoUrl(this.photoUrl || this.customerPhotoUrl || this.customer?.photoUrl || this.customer?.customerPhotoUrl || this.customer?.imageUrl);
    this.initials = this.buildInitials(this.customerName);
  }

  onImageError(): void {
    this.resolvedPhotoUrl = '';
  }

  get metaText(): string {
    return this.customerCode || this.email || this.phone || '';
  }

  private resolvePhotoUrl(url?: string | null): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const backendBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }

  private buildInitials(name?: string | null): string {
    const parts = (name || 'Customer').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'C';
  }
}
