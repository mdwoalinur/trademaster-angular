import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale } from '../models/sale.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;
  private saleItemUrl = `${environment.apiUrl}/sale-items`;
  private emailInvoiceUrl = `${environment.apiUrl}/email-invoices`;

  constructor(private http: HttpClient) {}

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl);
  }

  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  createSale(sale: Sale): Observable<Sale> {
    const { saleId, ...newSale } = sale;
    return this.http.post<Sale>(this.apiUrl, newSale);
  }

  updateSale(id: number, sale: Sale): Observable<Sale> {
    return this.http.put<Sale>(`${this.apiUrl}/${id}`, sale);
  }

  deleteSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSaleItems(saleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.saleItemUrl}/by-sale/${saleId}`);
}

posCheckout(payload: any): Observable<Sale> {
  return this.http.post<Sale>(`${this.apiUrl}/pos-checkout`, payload);
}

sendInvoiceEmail(saleId: number): Observable<any> {
  return this.http.post<any>(`${this.emailInvoiceUrl}/sales/${saleId}/send`, {});
}

}
