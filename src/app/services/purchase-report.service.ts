
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PurchaseReport } from '../models/purchase-report.model';

@Injectable({ providedIn: 'root' })
export class PurchaseReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getPurchaseReport(startDate: string, endDate: string): Observable<PurchaseReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<PurchaseReport>(`${this.apiUrl}/purchases`, { params });
  }
}