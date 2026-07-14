
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProfitLoss } from '../models/profit-loss.model';

@Injectable({ providedIn: 'root' })
export class ProfitLossService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getProfitLoss(startDate: string, endDate: string): Observable<ProfitLoss> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ProfitLoss>(`${this.apiUrl}/profit-loss`, { params });
  }
}