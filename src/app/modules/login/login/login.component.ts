import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'src/app/services/sweet-alert.helper';

type AuthMode = 'login' | 'request' | 'verify' | 'reset' | 'success';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

    username = '';
    password = '';
    rememberMe = false;
    showPassword = false;
    loading = false;

    mode: AuthMode = 'login';
    emailOrUsername = '';
    maskedEmail = '';
    otpDigits = ['', '', '', '', '', ''];
    newPassword = '';
    confirmPassword = '';
    showNewPassword = false;
    showConfirmPassword = false;
    recoveryLoading = false;
    resendSeconds = 45;
    private resendTimer?: number;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.setModeFromRoute();
    }

    ngOnDestroy(): void {
        this.clearResendTimer();
    }

    onSubmit(): void {
        if (!this.username || !this.password) {
            Swal.fire(this.translate.instant('LOGIN.ERROR_TITLE'), this.translate.instant('LOGIN.MISSING_CREDENTIALS'), 'error');
            return;
        }

        this.loading = true;
        this.authService.login(this.username, this.password).subscribe({
            next: (res) => {
                this.authService.storeSession(res);
                if (this.rememberMe) {
                    localStorage.setItem('rememberedUsername', this.username);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                console.error(err);
                Swal.fire(this.translate.instant('LOGIN.FAILED_TITLE'), this.translate.instant('LOGIN.INVALID_CREDENTIALS'), 'error');
                this.loading = false;
            }
        });
    }

    requestOtp(): void {
        if (!this.emailOrUsername.trim()) {
            Swal.fire(this.translate.instant('LOGIN.REQUIRED_TITLE'), this.translate.instant('LOGIN.EMAIL_REQUIRED'), 'warning');
            return;
        }
        this.recoveryLoading = true;
        this.authService.requestForgotPasswordOtp(this.emailOrUsername.trim()).subscribe({
            next: (res) => {
                this.recoveryLoading = false;
                this.maskedEmail = res?.maskedEmail || this.maskedEmail;
                this.storeRecoveryState();
                Swal.fire(this.translate.instant('LOGIN.CODE_SENT_TITLE'), res?.message || this.translate.instant('LOGIN.CODE_SENT_MESSAGE'), 'success');
                this.goRecoveryMode('verify');
                this.startResendTimer();
            },
            error: (err) => {
                this.recoveryLoading = false;
                Swal.fire(this.translate.instant('LOGIN.COULD_NOT_SEND_CODE'), this.errorMessage(err), 'error');
            }
        });
    }

    verifyOtp(): void {
        const otp = this.otpCode;
        if (!/^\d{6}$/.test(otp)) {
            Swal.fire(this.translate.instant('LOGIN.INVALID_CODE_TITLE'), this.translate.instant('LOGIN.INVALID_CODE_MESSAGE'), 'warning');
            return;
        }
        this.recoveryLoading = true;
        this.authService.verifyForgotPasswordOtp(this.emailOrUsername.trim(), otp).subscribe({
            next: (res) => {
                this.recoveryLoading = false;
                this.maskedEmail = res?.maskedEmail || this.maskedEmail;
                sessionStorage.setItem('forgotPasswordOtp', otp);
                this.storeRecoveryState();
                Swal.fire(this.translate.instant('LOGIN.VERIFIED_TITLE'), this.translate.instant('LOGIN.VERIFIED_MESSAGE'), 'success');
                this.goRecoveryMode('reset');
            },
            error: (err) => {
                this.recoveryLoading = false;
                Swal.fire(this.translate.instant('LOGIN.VERIFICATION_FAILED'), this.errorMessage(err), 'error');
            }
        });
    }

    resendOtp(): void {
        if (this.resendSeconds > 0 || this.recoveryLoading) return;
        this.recoveryLoading = true;
        this.authService.resendForgotPasswordOtp(this.emailOrUsername.trim()).subscribe({
            next: (res) => {
                this.recoveryLoading = false;
                this.maskedEmail = res?.maskedEmail || this.maskedEmail;
                this.storeRecoveryState();
                Swal.fire(this.translate.instant('LOGIN.CODE_SENT_TITLE'), res?.message || this.translate.instant('LOGIN.CODE_RESENT_MESSAGE'), 'success');
                this.startResendTimer();
            },
            error: (err) => {
                this.recoveryLoading = false;
                Swal.fire(this.translate.instant('LOGIN.COULD_NOT_RESEND_CODE'), this.errorMessage(err), 'error');
            }
        });
    }

    resetPassword(): void {
        if (!this.canResetPassword()) {
            Swal.fire(this.translate.instant('LOGIN.CHECK_PASSWORD'), this.translate.instant('LOGIN.CHECK_PASSWORD_MESSAGE'), 'warning');
            return;
        }
        this.recoveryLoading = true;
        this.authService.resetForgotPassword({
            emailOrUsername: this.emailOrUsername.trim(),
            otp: this.otpCode,
            newPassword: this.newPassword,
            confirmPassword: this.confirmPassword
        }).subscribe({
            next: () => {
                this.recoveryLoading = false;
                this.goRecoveryMode('success');
            },
            error: (err) => {
                this.recoveryLoading = false;
                Swal.fire(this.translate.instant('LOGIN.RESET_FAILED'), this.errorMessage(err), 'error');
            }
        });
    }

    onOtpInput(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        const value = input.value.replace(/\D/g, '');
        if (value.length > 1) {
            this.applyOtp(value);
            return;
        }
        this.otpDigits[index] = value;
        input.value = value;
        if (value && index < 5) {
            this.focusOtp(index + 1);
        }
    }

    onOtpKeydown(event: KeyboardEvent, index: number): void {
        if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
            this.focusOtp(index - 1);
        }
    }

    onOtpPaste(event: ClipboardEvent): void {
        event.preventDefault();
        this.applyOtp(event.clipboardData?.getData('text') || '');
    }

    goRecoveryMode(mode: AuthMode): void {
        this.mode = mode;
        const route = mode === 'request' ? '/forgot-password' : mode === 'verify' ? '/forgot-password/verify' : mode === 'reset' ? '/forgot-password/reset' : mode === 'success' ? '/forgot-password/success' : '/login';
        this.router.navigate([route], { replaceUrl: true });
    }

    backToSignIn(): void {
        this.clearResendTimer();
        this.mode = 'login';
        this.otpDigits = ['', '', '', '', '', ''];
        this.newPassword = '';
        this.confirmPassword = '';
        sessionStorage.removeItem('forgotPasswordEmailOrUsername');
        sessionStorage.removeItem('forgotPasswordMaskedEmail');
        sessionStorage.removeItem('forgotPasswordOtp');
        this.router.navigate(['/login']);
    }

    canResetPassword(): boolean {
        return this.passwordRequirements.every(item => item.met) && this.newPassword === this.confirmPassword && !!this.otpCode;
    }

    get otpCode(): string {
        return this.otpDigits.join('');
    }

    get passwordStrength(): 'Weak' | 'Medium' | 'Strong' {
        const met = this.passwordRequirements.filter(item => item.met).length;
        if (met >= 5) return 'Strong';
        if (met >= 3) return 'Medium';
        return 'Weak';
    }

    get passwordStrengthClass(): string {
        return this.passwordStrength.toLowerCase();
    }

    get passwordRequirements(): Array<{ label: string; met: boolean }> {
        return [
            { label: this.translate.instant('LOGIN.MINIMUM_8'), met: this.newPassword.length >= 8 },
            { label: this.translate.instant('LOGIN.ONE_UPPERCASE'), met: /[A-Z]/.test(this.newPassword) },
            { label: this.translate.instant('LOGIN.ONE_LOWERCASE'), met: /[a-z]/.test(this.newPassword) },
            { label: this.translate.instant('LOGIN.ONE_NUMBER'), met: /\d/.test(this.newPassword) },
            { label: this.translate.instant('LOGIN.ONE_SPECIAL'), met: /[^A-Za-z0-9]/.test(this.newPassword) }
        ];
    }

    get currentStep(): number {
        if (this.mode === 'request') return 1;
        if (this.mode === 'verify') return 2;
        return 3;
    }

    isStepComplete(step: number): boolean {
        return this.currentStep > step || this.mode === 'success';
    }

    private setModeFromRoute(): void {
        const url = this.router.url;
        this.mode = url.includes('/forgot-password/verify') ? 'verify'
            : url.includes('/forgot-password/reset') ? 'reset'
            : url.includes('/forgot-password/success') ? 'success'
            : url.includes('/forgot-password') ? 'request'
            : 'login';
        const remembered = localStorage.getItem('rememberedUsername');
        if (remembered) {
            this.username = remembered;
            this.rememberMe = true;
        }
        this.emailOrUsername = sessionStorage.getItem('forgotPasswordEmailOrUsername') || this.emailOrUsername;
        this.maskedEmail = sessionStorage.getItem('forgotPasswordMaskedEmail') || this.maskedEmail;
        const storedOtp = sessionStorage.getItem('forgotPasswordOtp');
        if (storedOtp) {
            this.applyOtp(storedOtp);
        }
        this.route.queryParamMap.subscribe(params => {
            const identifier = params.get('emailOrUsername');
            if (identifier) this.emailOrUsername = identifier;
        });
        if (this.mode === 'verify') {
            this.startResendTimer();
        }
    }

    private applyOtp(value: string): void {
        const digits = value.replace(/\D/g, '').slice(0, 6).split('');
        this.otpDigits = ['', '', '', '', '', ''];
        digits.forEach((digit, i) => this.otpDigits[i] = digit);
        setTimeout(() => this.focusOtp(Math.min(digits.length, 5)), 0);
    }

    private storeRecoveryState(): void {
        if (this.emailOrUsername.trim()) {
            sessionStorage.setItem('forgotPasswordEmailOrUsername', this.emailOrUsername.trim());
        }
        if (this.maskedEmail) {
            sessionStorage.setItem('forgotPasswordMaskedEmail', this.maskedEmail);
        }
    }

    private focusOtp(index: number): void {
        const input = this.otpInputs?.toArray()[index]?.nativeElement;
        input?.focus();
        input?.select();
    }

    private startResendTimer(): void {
        this.clearResendTimer();
        this.resendSeconds = 45;
        this.resendTimer = window.setInterval(() => {
            this.resendSeconds = Math.max(this.resendSeconds - 1, 0);
            if (this.resendSeconds === 0) this.clearResendTimer();
        }, 1000);
    }

    private clearResendTimer(): void {
        if (this.resendTimer) {
            clearInterval(this.resendTimer);
            this.resendTimer = undefined;
        }
    }

    private errorMessage(err: any): string {
        if (typeof err?.error === 'string') return err.error;
        return err?.error?.message || err?.error?.error || err?.message || 'Could not complete the request. Please try again.';
    }
}
