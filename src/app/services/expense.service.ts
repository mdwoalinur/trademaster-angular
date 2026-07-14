import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Expense } from '../models/expense.model';
import { ExpenseAttachment } from '../models/expense-attachment.model'; 

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(page: number = 0, size: number = 10, status?: string, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  create(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  update(id: number, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approve(id: number): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number, reason: string): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  requestPayment(id: number, requestedAmount?: number, paymentMethod?: string, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/request-payment`, { requestedAmount, paymentMethod, notes });
  }

  getPaymentSummary(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/payment-summary`);
  }

  getPayments(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/payments`);
  }

  addAttachment(expenseId: number, file: File): Observable<ExpenseAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ExpenseAttachment>(`${this.apiUrl}/${expenseId}/attachments`, formData);
  }

  getAttachments(expenseId: number): Observable<ExpenseAttachment[]> {
    return this.http.get<ExpenseAttachment[]>(`${this.apiUrl}/${expenseId}/attachments`);
  }

  getAttachmentUrl(fileName: string): string {
    return `${environment.apiUrl}/files/receipts/${encodeURIComponent(fileName)}`;
  }

  downloadAttachment(fileName: string): Observable<Blob> {
    return this.http.get(this.getAttachmentUrl(fileName), { responseType: 'blob' });
  }

  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/attachments/${attachmentId}`);
  }
}
