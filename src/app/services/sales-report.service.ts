
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SalesReport } from '../models/sales-report.model';

@Injectable({ providedIn: 'root' })
export class SalesReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSalesReport(startDate: string, endDate: string): Observable<SalesReport> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<SalesReport>(`${this.apiUrl}/sales`, { params });
  }
}