import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Purchase } from '../models/purchase.model';
import { environment } from '../../environments/environment';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/purchases`;
  private emailInvoiceUrl = `${environment.apiUrl}/email-invoices`;

  constructor(private http: HttpClient) {}

  getPurchases(page: number, size: number, status?: string, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getPurchaseById(id: number): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.apiUrl}/${id}`);
  }

  createPurchase(purchase: Purchase): Observable<Purchase> {
    return this.http.post<Purchase>(this.apiUrl, purchase);
  }

  updatePurchase(id: number, purchase: Purchase): Observable<Purchase> {
    return this.http.put<Purchase>(`${this.apiUrl}/${id}`, purchase);
  }

  deletePurchase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAsReceived(id: number, deliveryDate: Date, notes: string): Observable<Purchase> {
    return this.http.post<Purchase>(`${this.apiUrl}/${id}/receive`, { deliveryDate, notes });
  }

  cancelPurchase(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  sendOrderEmail(purchaseId: number): Observable<any> {
    return this.http.post<any>(`${this.emailInvoiceUrl}/purchases/${purchaseId}/send`, {});
  }

  requestPayment(purchaseId: number, payload: any): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${purchaseId}/request-payment`, payload);
  }

  getPaymentSummary(purchaseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${purchaseId}/payment-summary`);
  }

  getPayments(purchaseId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/${purchaseId}/payments`);
  }
}
