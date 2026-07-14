import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuditLog } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
    private apiUrl = `${environment.apiUrl}/audit-logs`;

    constructor(private http: HttpClient) {}

    getLogs(page: number, size: number, filters?: any): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (filters?.userId) params = params.set('userId', filters.userId);
        if (filters?.action) params = params.set('action', filters.action);
        if (filters?.entityType) params = params.set('entityType', filters.entityType);
        if (filters?.search) params = params.set('search', filters.search);
        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: number): Observable<AuditLog> {
        return this.http.get<AuditLog>(`${this.apiUrl}/${id}`);
    }
}