import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) {}

    getAll(page: number, size: number): Observable<any> {
        let params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<any>(this.apiUrl, { params });
    }

    getById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    create(user: User): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    update(id: number, user: User): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}