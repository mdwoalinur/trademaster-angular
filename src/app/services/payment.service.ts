
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getPayments(page: number = 0, size: number = 10, type?: string, status?: string, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  create(payment: Payment, submit = false): Observable<Payment> {
    const params = submit ? new HttpParams().set('submit', true) : undefined;
    return this.http.post<Payment>(this.apiUrl, payment, { params });
  }

  update(id: number, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, payment);
  }

  submit(id: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/submit`, {});
  }

  getPendingApprovals(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pending-approvals`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  approveAndPost(
    id: number,
    approvedAmount?: number,
    accountId?: number,
    destinationAccountId?: number,
    comments?: string
  ): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/approve-and-post`, {
      approvedAmount,
      accountId,
      destinationAccountId,
      comments
    });
  }

  reject(id: number, reason: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  returnForCorrection(id: number, comments: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/return`, { comments });
  }

  cancel(id: number, reason: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  createRefund(id: number, amount: number, accountId: number | null, reason: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/refund`, { amount, accountId, reason });
  }

  createReversal(id: number, reason: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/reversal`, { reason });
  }

  history(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }

  allocations(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/allocations`);
  }

  searchParties(paymentType: string, search = '', page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('paymentType', paymentType)
      .set('page', page)
      .set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.apiUrl}/parties`, { params });
  }

  outstandingReferences(paymentType: string, partyId?: number, search = '', page = 0, size = 20): Observable<any> {
    let params = new HttpParams()
      .set('paymentType', paymentType)
      .set('page', page)
      .set('size', size);
    if (partyId) params = params.set('partyId', partyId);
    if (search) params = params.set('search', search);
    return this.http.get<any>(`${this.apiUrl}/outstanding-references`, { params });
  }

  getAttachments(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/attachments`);
  }

  uploadAttachment(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/${id}/attachments`, formData);
  }

  deleteAttachment(paymentId: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${paymentId}/attachments/${attachmentId}`);
  }

  attachmentDownloadUrl(paymentId: number, attachmentId: number): string {
    return `${this.apiUrl}/${paymentId}/attachments/${attachmentId}/download`;
  }

  dashboard(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { params });
  }

  paymentRegister(startDate?: string, endDate?: string, status?: string, method?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (status) params = params.set('status', status);
    if (method) params = params.set('method', method);
    return this.http.get<any>(`${this.apiUrl}/reports/register`, { params });
  }

  accountStatement(accountId: number, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams().set('accountId', accountId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/reports/account-statement`, { params });
  }

  partyLedger(partyType: string, partyId: number, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams().set('partyType', partyType).set('partyId', partyId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any>(`${this.apiUrl}/reports/party-ledger`, { params });
  }

  reconciliationEntries(accountId?: number, status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (accountId) params = params.set('accountId', accountId);
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.apiUrl}/reconciliation/statement-entries`, { params }).pipe(
      map(response => Array.isArray(response) ? response : (response?.content || []))
    );
  }

  importStatement(accountId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/reconciliation/import`, formData, {
      params: new HttpParams().set('accountId', accountId)
    });
  }

  matchStatementEntry(statementEntryId: number, paymentId: number, comments?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reconciliation/${statementEntryId}/match`, { paymentId, comments });
  }

  reconcileStatementEntry(statementEntryId: number, comments?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reconciliation/${statementEntryId}/reconcile`, { comments });
  }

  unmatchStatementEntry(statementEntryId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reconciliation/${statementEntryId}/unmatch`, {});
  }

  reconciliationSummary(accountId?: number): Observable<any> {
    let params = new HttpParams();
    if (accountId) params = params.set('accountId', accountId);
    return this.http.get<any>(`${this.apiUrl}/reconciliation/summary`, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
