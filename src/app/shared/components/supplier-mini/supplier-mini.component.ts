import { Component, Input, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-supplier-mini',
  templateUrl: './supplier-mini.component.html',
  styleUrls: ['./supplier-mini.component.css']
})
export class SupplierMiniComponent implements OnChanges {
  @Input() photoUrl?: string | null;
  @Input() supplierName?: string | null;
  @Input() supplierCode?: string | null;
  @Input() email?: string | null;
  @Input() phone?: string | null;
  @Input() contactPerson?: string | null;
  @Input() compact = false;

  resolvedPhotoUrl = '';
  imageFailed = false;

  ngOnChanges(): void {
    this.resolvedPhotoUrl = this.resolvePhotoUrl(this.photoUrl);
    this.imageFailed = false;
  }

  get initials(): string {
    const parts = (this.supplierName || 'Supplier').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'S';
  }

  get meta(): string {
    return [this.supplierCode, this.contactPerson, this.email, this.phone].filter(Boolean).join(' | ');
  }

  onImageError(): void {
    this.imageFailed = true;
  }

  private resolvePhotoUrl(photoUrl?: string | null): string {
    if (!photoUrl) return '';
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${apiRoot}${photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl}`;
  }
}
