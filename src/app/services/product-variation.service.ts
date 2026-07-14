import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductVariation } from '../models/product-variation.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductVariationService {
  private apiUrl = `${environment.apiUrl}/product-variations`;

  constructor(private http: HttpClient) {}

  getVariations(): Observable<ProductVariation[]> {
    return this.http.get<ProductVariation[]>(this.apiUrl);
  }

  getVariationById(id: number): Observable<ProductVariation> {
    return this.http.get<ProductVariation>(`${this.apiUrl}/${id}`);
  }

  createVariation(variation: ProductVariation): Observable<ProductVariation> {
    return this.http.post<ProductVariation>(this.apiUrl, this.toVariationPayload(variation));
  }

  createVariationWithImage(variation: ProductVariation, image?: File | null): Observable<ProductVariation> {
    return this.http.post<ProductVariation>(this.apiUrl, this.buildVariationFormData(variation, image || null));
  }

  updateVariation(id: number, variation: ProductVariation): Observable<ProductVariation> {
    return this.http.put<ProductVariation>(`${this.apiUrl}/${id}`, this.toVariationPayload(variation));
  }

  updateVariationWithImage(id: number, variation: ProductVariation, image?: File | null): Observable<ProductVariation> {
    return this.http.put<ProductVariation>(`${this.apiUrl}/${id}`, this.buildVariationFormData(variation, image || null));
  }

  deleteVariation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVariationImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) return '';
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${apiRoot}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
  }

  private buildVariationFormData(variation: Partial<ProductVariation>, image: File | null): FormData {
    const formData = new FormData();
    formData.append('variation', new Blob([JSON.stringify(this.toVariationPayload(variation))], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    return formData;
  }

  private toVariationPayload(variation: Partial<ProductVariation>): Partial<ProductVariation> {
    const payload: Partial<ProductVariation> = {
      productId: Number(variation.productId || 0),
      variationName: variation.variationName || '',
      sku: variation.sku || '',
      buyingPrice: Number(variation.buyingPrice || 0),
      additionalPrice: Number(variation.additionalPrice || 0),
      status: variation.status !== false
    };

    if (variation.imageUrl === '') {
      payload.imageUrl = '';
    }

    return payload;
  }
}
