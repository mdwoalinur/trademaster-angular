
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaxReport } from '../models/tax-report.model';

@Injectable({ providedIn: 'root' })
export class TaxReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getTaxReport(startDate: string, endDate: string): Observable<TaxReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<TaxReport>(`${this.apiUrl}/tax`, { params });
  }
}