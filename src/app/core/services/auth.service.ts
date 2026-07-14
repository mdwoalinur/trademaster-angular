import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface CurrentUserProfile {
    userId: number;
    username: string;
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    designation?: string;
    address?: string;
    profileImageUrl?: string;
    roleId?: number;
    roleName?: string;
    roleDisplayName?: string;
    isActive?: boolean;
    status?: string;
    lastLogin?: string;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private profileApiUrl = `${environment.apiUrl}/profile`;
    private currentUserSubject = new BehaviorSubject<CurrentUserProfile | null>(this.getCachedProfile());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {}

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { username, password });
    }

    requestForgotPasswordOtp(emailOrUsername: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password/request-otp`, { emailOrUsername });
    }

    verifyForgotPasswordOtp(emailOrUsername: string, otp: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password/verify-otp`, { emailOrUsername, otp });
    }

    resendForgotPasswordOtp(emailOrUsername: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password/resend-otp`, { emailOrUsername });
    }

    resetForgotPassword(payload: {
        emailOrUsername: string;
        otp: string;
        newPassword: string;
        confirmPassword: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password/reset`, payload);
    }

    getCurrentUser(): Observable<CurrentUserProfile> {
        return this.http.get<CurrentUserProfile>(`${this.apiUrl}/me`);
    }

    refreshCurrentUser(): Observable<CurrentUserProfile> {
        return this.http.get<CurrentUserProfile>(`${this.profileApiUrl}/me`).pipe(
            tap(profile => this.storeUserProfile(profile))
        );
    }

    storeSession(res: any): void {
        localStorage.setItem('token', res.token);
        this.storeUserProfile(res);
    }

    storeUserProfile(profile: Partial<CurrentUserProfile>): void {
        if (profile.userId != null) localStorage.setItem('userId', String(profile.userId));
        if (profile.username) localStorage.setItem('username', profile.username);
        this.setOrRemove('fullName', profile.fullName);
        this.setOrRemove('roleName', profile.roleName);
        this.setOrRemove('roleDisplayName', profile.roleDisplayName);
        this.setOrRemove('email', profile.email);
        this.setOrRemove('phone', profile.phone);
        this.setOrRemove('profileImageUrl', profile.profileImageUrl);
        this.setOrRemove('lastLogin', profile.lastLogin);
        if (profile.isActive != null) localStorage.setItem('isActive', String(profile.isActive));

        const cached = this.getCachedProfile();
        this.currentUserSubject.next(cached);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        localStorage.removeItem('roleName');
        localStorage.removeItem('roleDisplayName');
        localStorage.removeItem('email');
        localStorage.removeItem('phone');
        localStorage.removeItem('profileImageUrl');
        localStorage.removeItem('lastLogin');
        localStorage.removeItem('isActive');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }

    getCachedProfile(): CurrentUserProfile | null {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        if (!userId || !username) return null;
        const cachedIsActive = localStorage.getItem('isActive');

        return {
            userId: Number(userId),
            username,
            fullName: localStorage.getItem('fullName') || undefined,
            roleName: localStorage.getItem('roleName') || undefined,
            roleDisplayName: localStorage.getItem('roleDisplayName') || undefined,
            email: localStorage.getItem('email') || undefined,
            phone: localStorage.getItem('phone') || undefined,
            profileImageUrl: localStorage.getItem('profileImageUrl') || undefined,
            lastLogin: localStorage.getItem('lastLogin') || undefined,
            isActive: cachedIsActive == null ? undefined : cachedIsActive === 'true'
        };
    }

    private setOrRemove(key: string, value?: string | null): void {
        if (value == null || value === '') {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    }
}
