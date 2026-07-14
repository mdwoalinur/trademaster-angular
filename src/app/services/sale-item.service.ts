import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaleItem } from 'src/app/models/sale-item.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SaleItemService {
  private apiUrl = `${environment.apiUrl}/sale-items`;

  constructor(private http: HttpClient) {}

  getSaleItems(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(this.apiUrl);
  }

  getSaleItemById(id: number): Observable<SaleItem> {
    return this.http.get<SaleItem>(`${this.apiUrl}/${id}`);
  }

  getSaleItemsBySaleId(saleId: number): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(`${this.apiUrl}/by-sale/${saleId}`);
  }

  createSaleItem(saleItem: SaleItem): Observable<SaleItem> {
    const { salesItemId, ...newItem } = saleItem;
    return this.http.post<SaleItem>(this.apiUrl, newItem);
  }

  updateSaleItem(id: number, saleItem: SaleItem): Observable<SaleItem> {
    return this.http.put<SaleItem>(`${this.apiUrl}/${id}`, saleItem);
  }

  deleteSaleItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}