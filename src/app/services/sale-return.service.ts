import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SaleReturn } from '../models/sale-return.model';
import { SaleReturnItem } from '../models/sale-return-item.model';

@Injectable({ providedIn: 'root' })
export class SaleReturnService {
    private apiUrl = `${environment.apiUrl}/sales-returns`;

    constructor(private http: HttpClient) {}

    getAll(page: number, size: number, status?: string): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (status) params = params.set('status', status);
        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: number): Observable<SaleReturn> {
        return this.http.get<SaleReturn>(`${this.apiUrl}/${id}`);
    }

    getBySale(saleId: number): Observable<SaleReturn[]> {
        return this.http.get<SaleReturn[]>(`${this.apiUrl}/sale/${saleId}`);
    }

    create(saleReturn: SaleReturn, items: SaleReturnItem[]): Observable<SaleReturn> {
    const body = { saleReturn, items };  
    return this.http.post<SaleReturn>(this.apiUrl, body);
}

    approve(id: number, approvedBy: number): Observable<SaleReturn> {
        return this.http.put<SaleReturn>(`${this.apiUrl}/${id}/approve`, { approvedBy });
    }

    reject(id: number, reason: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/reject`, { reason });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}