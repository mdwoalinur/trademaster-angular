import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduct(product: Product, image?: File | null): Observable<Product> {
    const body = image ? this.buildProductFormData(product, image) : product;
    return this.http.post<Product>(this.apiUrl, body).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(id: number, product: Product, image?: File | null): Observable<Product> {
    const body = image ? this.buildProductFormData(product, image) : product;
    return this.http.put<Product>(`${this.apiUrl}/${id}`, body).pipe(
      catchError(this.handleError)
    );
  }

  getProductImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) return 'assets/images/placeholder.png';
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${apiRoot}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?q=${keyword}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error (${error.status}): ${error.message}`;
      if (error.error && typeof error.error === 'object') {
        if (error.error.message) errorMessage = error.error.message;
        else if (error.error.error) errorMessage = error.error.error;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  getProductByCode(code: string): Observable<Product> {
    return this.getProductByScannedCode(code);
  }

  getProductByScannedCode(rawCode: string): Observable<Product> {
    const code = String(rawCode || '').trim();
    if (!code) return throwError(() => new Error('Empty scanned product code'));
    return this.http.get<Product>(`${this.apiUrl}/by-code/${encodeURIComponent(code)}`);
  }

  private buildProductFormData(product: Product, image: File): FormData {
    const formData = new FormData();
    const productPayload = this.buildProductPayload(product);
    formData.append('product', new Blob([JSON.stringify(productPayload)], { type: 'application/json' }), 'product.json');
    formData.append('image', image);
    return formData;
  }

  private buildProductPayload(product: Product): Partial<Product> {
    return {
      categoryId: product.categoryId,
      productCode: product.productCode,
      sku: product.sku,
      productName: product.productName,
      description: product.description,
      imageUrl: product.imageUrl,
      baseUnitId: product.baseUnitId,
      buyingPrice: product.buyingPrice,
      sellingPrice: product.sellingPrice,
      taxRate: product.taxRate,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      reorderLevel: product.reorderLevel,
      selectUnit: product.selectUnit,
      status: product.status
    };
  }
}
