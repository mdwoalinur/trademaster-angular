import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AccountLedgerEntry, FinancialAccount, FinancialAccountStatus } from '../models/financial-account.model';

@Injectable({ providedIn: 'root' })
export class FinancialAccountService {
  private apiUrl = `${environment.apiUrl}/financial-accounts`;

  constructor(private http: HttpClient) {}

  getAccounts(status?: FinancialAccountStatus | ''): Observable<FinancialAccount[]> {
    const options = status ? { params: new HttpParams().set('status', status) } : {};
    return this.http.get<any>(this.apiUrl, options).pipe(
      map(response => Array.isArray(response) ? response : (response?.content || []))
    );
  }

  search(keyword: string): Observable<FinancialAccount[]> {
    return this.http.get<FinancialAccount[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('keyword', keyword)
    });
  }

  getById(id: number): Observable<FinancialAccount> {
    return this.http.get<FinancialAccount>(`${this.apiUrl}/${id}`);
  }

  create(account: FinancialAccount): Observable<FinancialAccount> {
    return this.http.post<FinancialAccount>(this.apiUrl, account);
  }

  update(id: number, account: FinancialAccount): Observable<FinancialAccount> {
    return this.http.put<FinancialAccount>(`${this.apiUrl}/${id}`, account);
  }

  updateStatus(id: number, status: FinancialAccountStatus): Observable<FinancialAccount> {
    return this.http.patch<FinancialAccount>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  statement(id: number, startDate?: string, endDate?: string): Observable<AccountLedgerEntry[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<AccountLedgerEntry[]>(`${this.apiUrl}/${id}/statement`, { params });
  }
}
