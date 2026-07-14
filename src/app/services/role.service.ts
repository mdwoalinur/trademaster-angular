import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
    private apiUrl = `${environment.apiUrl}/roles`;

    constructor(private http: HttpClient) {}

    /** Get all roles (unpaginated) – for dropdowns */
    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.apiUrl}/all`);
    }

    /** Get paginated roles */
    getAll(page: number, size: number): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<any>(this.apiUrl, { params });
    }

    /** Get role by ID */
    getById(id: number): Observable<Role> {
        return this.http.get<Role>(`${this.apiUrl}/${id}`);
    }

    /** Create new role */
    create(role: Role): Observable<Role> {
        return this.http.post<Role>(this.apiUrl, role);
    }

    /** Update existing role */
    update(id: number, role: Role): Observable<Role> {
        return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
    }

    /** Delete (soft delete) role */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}