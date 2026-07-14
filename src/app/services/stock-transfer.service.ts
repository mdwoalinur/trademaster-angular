import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StockTransfer, StockTransferItem } from '../models/stock-transfer.model';

@Injectable({ providedIn: 'root' })
export class StockTransferService {
    private apiUrl = `${environment.apiUrl}/stock-transfers`;

    constructor(private http: HttpClient) {}

    getAll(page: number, size: number): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: number): Observable<StockTransfer> {
        return this.http.get<StockTransfer>(`${this.apiUrl}/${id}`);
    }

    create(transfer: StockTransfer, items: StockTransferItem[]): Observable<StockTransfer> {
        const body = { transfer, items };
        return this.http.post<StockTransfer>(this.apiUrl, body);
    }

    approve(id: number, approvedBy: number): Observable<StockTransfer> {
        return this.http.put<StockTransfer>(`${this.apiUrl}/${id}/approve`, { approvedBy });
    }

    reject(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/reject`, {});
    }

    cancel(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
    }
}