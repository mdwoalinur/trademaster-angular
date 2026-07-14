import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PurchaseReturn, ReturnablePurchaseItem } from '../models/purchase-return.model';

@Injectable({ providedIn: 'root' })
export class PurchaseReturnService {
  private apiUrl = `${environment.apiUrl}/purchase-returns`;
  private purchaseUrl = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  getAll(filters: { status?: string; search?: string; startDate?: string; endDate?: string } = {}): Observable<PurchaseReturn[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<PurchaseReturn[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<PurchaseReturn> {
    return this.http.get<PurchaseReturn>(`${this.apiUrl}/${id}`);
  }

  create(payload: PurchaseReturn): Observable<PurchaseReturn> {
    return this.http.post<PurchaseReturn>(this.apiUrl, payload);
  }

  update(id: number, payload: PurchaseReturn): Observable<PurchaseReturn> {
    return this.http.put<PurchaseReturn>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  confirm(id: number): Observable<PurchaseReturn> {
    return this.http.post<PurchaseReturn>(`${this.apiUrl}/${id}/confirm`, {});
  }

  getByPurchase(purchaseId: number): Observable<PurchaseReturn[]> {
    return this.http.get<PurchaseReturn[]>(`${this.apiUrl}/by-purchase/${purchaseId}`);
  }

  getReturnableItems(purchaseId: number): Observable<ReturnablePurchaseItem[]> {
    return this.http.get<ReturnablePurchaseItem[]>(`${this.purchaseUrl}/${purchaseId}/returnable-items`);
  }
}
