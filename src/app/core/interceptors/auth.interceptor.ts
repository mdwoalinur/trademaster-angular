import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();
        const request = token
            ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
            : req;

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (this.shouldRedirectToLogin(error, token)) {
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }

    private shouldRedirectToLogin(error: HttpErrorResponse, token: string | null): boolean {
        if (error.status !== 401 && error.status !== 403) return false;
        if (!token || this.isTokenExpired(token)) return true;

        const message = this.getErrorMessage(error).toLowerCase();
        return message.includes('jwt')
            || message.includes('token expired')
            || message.includes('expired token')
            || message.includes('invalid token')
            || message.includes('unauthorized');
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1] || ''));
            return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
        } catch {
            return true;
        }
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        if (typeof error.error === 'string') return error.error;
        return error.error?.message || error.message || '';
    }
}
