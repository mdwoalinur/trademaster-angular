import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, Subject, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private apiUrl = `${environment.apiUrl}/notifications`;
    private notificationsChangedSubject = new Subject<void>();
    notificationsChanged$ = this.notificationsChangedSubject.asObservable();
    private notificationBackoffUntil = 0;
    private readonly networkBackoffMs = 60000;

    constructor(private http: HttpClient) {}

    generateNotifications(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/generate`, {});
    }

    getUnreadCount(): Observable<number> {
        if (!this.canPollNotifications()) {
            return of(0);
        }
        return this.http.get<number>(`${this.apiUrl}/unread-count`).pipe(
            catchError(error => this.handlePollingError(error, 0))
        );
    }

    getUnreadNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
    }

    markAsRead(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/read`, {});
    }

    markAllAsRead(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/mark-all-read`, {});
    }

    getAllNotifications(page: number, size: number, type: string, search: string, read?: boolean | ''): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (type) params = params.set('type', type);
    if (search) params = params.set('search', search);
    if (read !== '' && read !== undefined) params = params.set('read', String(read));
    return this.http.get<any>(`${this.apiUrl}/all`, { params });
}

deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

bulkDelete(ids: number[]): Observable<{ deletedCount: number; message?: string }> {
    return this.http.delete<{ deletedCount: number; message?: string }>(`${this.apiUrl}/bulk`, { body: { ids } });
}

clearAllNotifications(): Observable<{ deletedCount: number; message?: string }> {
    return this.http.delete<{ deletedCount: number; message?: string }>(`${this.apiUrl}/clear-all`);
}

notifyNotificationsChanged(): void {
    this.notificationsChangedSubject.next();
}

getRecentNotifications(limit: number = 5): Observable<Notification[]> {
    if (!this.canPollNotifications()) {
        return of([]);
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/recent?limit=${limit}`).pipe(
        catchError(error => this.handlePollingError(error, []))
    );
}

private canPollNotifications(): boolean {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return false;
    }
    return Date.now() >= this.notificationBackoffUntil;
}

private handlePollingError<T>(error: unknown, fallback: T): Observable<T> {
    if (error instanceof HttpErrorResponse && error.status === 0) {
        this.notificationBackoffUntil = Date.now() + this.networkBackoffMs;
        return of(fallback);
    }
    return throwError(() => error);
}

}
