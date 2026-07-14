import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'src/app/services/sweet-alert.helper';
import { AuthService, CurrentUserProfile } from 'src/app/core/services/auth.service';
import { ProfileService, ActivityLog } from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile?: CurrentUserProfile;
  profileForm: FormGroup;
  activityLogs: ActivityLog[] = [];
  loading = false;
  saving = false;
  uploading = false;
  photoPreview = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadActivityLogs();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getMe().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.photoPreview = this.profileService.resolveImageUrl(profile.profileImageUrl);
        this.profileForm.patchValue({
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          address: profile.address || ''
        });
        this.authService.storeUserProfile(profile);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load profile', 'error');
      }
    });
  }

  loadActivityLogs(): void {
    this.profileService.getActivityLogs().subscribe({
      next: (logs) => this.activityLogs = logs.slice(0, 6),
      error: () => this.activityLogs = []
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.profileService.updateMe(this.profileForm.value).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.authService.storeUserProfile(profile);
        this.authService.refreshCurrentUser().subscribe({
          next: refreshed => this.profile = refreshed
        });
        this.profileForm.markAsPristine();
        this.saving = false;
        Swal.fire('Success', 'Profile updated successfully', 'success');
      },
      error: (err) => {
        this.saving = false;
        Swal.fire('Error', err?.error?.message || 'Failed to update profile', 'error');
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      Swal.fire('Invalid file', 'Use JPG, JPEG or PNG image up to 2MB', 'warning');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.photoPreview = String(reader.result || '');
    reader.readAsDataURL(file);

    this.uploading = true;
    this.profileService.uploadPhoto(file).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.photoPreview = this.profileService.resolveImageUrl(profile.profileImageUrl);
        this.authService.storeUserProfile(profile);
        this.authService.refreshCurrentUser().subscribe({
          next: refreshed => {
            this.profile = refreshed;
            this.photoPreview = this.profileService.resolveImageUrl(refreshed.profileImageUrl);
          }
        });
        this.uploading = false;
        Swal.fire('Success', 'Profile photo updated', 'success');
      },
      error: (err) => {
        this.uploading = false;
        this.photoPreview = this.profileService.resolveImageUrl(this.profile?.profileImageUrl);
        Swal.fire('Error', err?.error?.message || 'Photo upload failed', 'error');
      }
    });
  }

  get initials(): string {
    const name = this.profile?.fullName || this.profile?.username || 'User';
    return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'U';
  }

  get roleDisplayName(): string {
    return this.profile?.roleDisplayName || this.formatRole(this.profile?.roleName || 'User');
  }

  formatRole(roleName: string): string {
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrator',
      ADMIN: 'Administrator',
      MANAGER: 'Manager',
      SALESMAN: 'Sales Executive',
      EMPLOYEE: 'Employee'
    };
    return roleMap[roleName] || roleName.toLowerCase().split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }
}
