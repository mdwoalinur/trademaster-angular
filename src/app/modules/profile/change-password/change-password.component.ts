import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'src/app/services/sweet-alert.helper';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  otpForm: FormGroup;
  saving = false;
  otpSent = false;
  resending = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
    this.otpForm = this.fb.group({
      otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  requestOtp(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      Swal.fire('Warning', 'New password and confirm password do not match', 'warning');
      return;
    }

    this.saving = true;
    this.profileService.requestPasswordChangeOtp(this.passwordForm.value).subscribe({
      next: (res) => {
        this.saving = false;
        this.otpSent = true;
        Swal.fire('Success', res.message || 'Confirmation code has been sent to your email.', 'success');
      },
      error: (err) => {
        this.saving = false;
        Swal.fire('Error', err?.error?.message || 'Could not send confirmation code', 'error');
      }
    });
  }

  confirmOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.profileService.confirmPasswordChange(this.otpForm.value).subscribe({
      next: (res) => {
        this.saving = false;
        this.passwordForm.reset();
        this.otpForm.reset();
        this.otpSent = false;
        Swal.fire('Success', res.message || 'Password changed successfully', 'success');
      },
      error: (err) => {
        this.saving = false;
        Swal.fire('Error', err?.error?.message || 'Password confirmation failed', 'error');
      }
    });
  }

  resendOtp(): void {
    this.resending = true;
    this.profileService.resendPasswordChangeOtp().subscribe({
      next: (res) => {
        this.resending = false;
        Swal.fire('Success', res.message || 'Confirmation code has been resent to your email.', 'success');
      },
      error: (err) => {
        this.resending = false;
        Swal.fire('Error', err?.error?.message || 'Could not resend confirmation code', 'error');
      }
    });
  }
}
