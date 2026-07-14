import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SystemSetting } from '../models/system-setting.model';

@Injectable({ providedIn: 'root' })
export class SystemSettingService {
    private apiUrl = `${environment.apiUrl}/settings`;

    constructor(private http: HttpClient) {}

    getEditable(): Observable<SystemSetting[]> {
        return this.http.get<SystemSetting[]>(`${this.apiUrl}/editable`);
    }

    update(updates: { [key: string]: string }): Observable<void> {
        return this.http.put<void>(this.apiUrl, updates);
    }
}