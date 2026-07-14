
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryReport } from '../models/inventory-report.model';

@Injectable({ providedIn: 'root' })
export class InventoryReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getInventoryReport(): Observable<InventoryReport> {
    return this.http.get<InventoryReport>(`${this.apiUrl}/inventory`);
  }
}