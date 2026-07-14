import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CurrentUserProfile } from 'src/app/core/services/auth.service';

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ActivityLog {
  logId: number;
  username: string;
  action: string;
  entityType?: string;
  entityId?: number;
  ipAddress?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<CurrentUserProfile> {
    return this.http.get<CurrentUserProfile>(`${this.apiUrl}/me`);
  }

  updateMe(payload: Pick<CurrentUserProfile, 'fullName' | 'phone' | 'address'>): Observable<CurrentUserProfile> {
    return this.http.put<CurrentUserProfile>(`${this.apiUrl}/me`, payload);
  }

  uploadPhoto(file: File): Observable<CurrentUserProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CurrentUserProfile>(`${this.apiUrl}/upload-photo`, formData);
  }

  changePassword(payload: PasswordChangeRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, payload);
  }

  requestPasswordChangeOtp(payload: PasswordChangeRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password/request-otp`, payload);
  }

  confirmPasswordChange(payload: { otpCode: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password/confirm`, payload);
  }

  resendPasswordChangeOtp(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password/resend-otp`, {});
  }

  getActivityLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/activity-logs`);
  }

  updateSettings(payload: Record<string, unknown>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/settings`, payload);
  }

  resolveImageUrl(url?: string): string {
    if (!url) {
      return '';
    }
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${apiRoot}${url.startsWith('/') ? url : `/${url}`}`;
  }
}
