import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SystemSettingService } from 'src/app/services/system-setting.service';
import { SystemSetting } from 'src/app/models/system-setting.model';
import { AppLanguage, LanguageService } from 'src/app/core/services/language.service';
import { AppTheme, ThemeService } from 'src/app/core/services/theme.service';
import { CurrentUserProfile } from 'src/app/core/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    settingsForm: FormGroup;
    passwordForm: FormGroup;
    loading = false;
    profileLoading = false;
    passwordSaving = false;
    settingsList: SystemSetting[] = [];
    profile?: CurrentUserProfile;
    selectedTheme: AppTheme = 'light';
    selectedLanguage: AppLanguage = 'en';

    constructor(
        private fb: FormBuilder,
        private settingService: SystemSettingService,
        private profileService: ProfileService,
        private themeService: ThemeService,
        private languageService: LanguageService
    ) {
        this.settingsForm = this.fb.group({});
        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.selectedTheme = this.themeService.getCurrentTheme();
        this.selectedLanguage = this.languageService.getCurrentLanguage();
        this.loadProfile();
        this.loadSettings();
    }

    loadProfile(): void {
        this.profileLoading = true;
        this.profileService.getMe().subscribe({
            next: (profile) => {
                this.profile = profile;
                this.profileLoading = false;
            },
            error: () => this.profileLoading = false
        });
    }

    loadSettings(): void {
        this.loading = true;
        this.settingService.getEditable().subscribe({
            next: (data) => {
                this.settingsList = data;
                // Create form controls dynamically
                data.forEach(setting => {
                    this.settingsForm.addControl(setting.settingKey, this.fb.control(setting.settingValue));
                });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                Swal.fire('Error', 'Failed to load settings', 'error');
            }
        });
    }

    // Helper for checkbox change
    updateCheckbox(key: string, event: Event): void {
        const input = event.target as HTMLInputElement;
        this.settingsForm.get(key)?.setValue(input.checked ? 'true' : 'false');
    }

    save(): void {
        if (this.settingsForm.pristine) return;

        const updates: { [key: string]: string } = {};
        for (const setting of this.settingsList) {
            updates[setting.settingKey] = this.settingsForm.get(setting.settingKey)?.value;
        }

        this.loading = true;
        this.settingService.update(updates).subscribe({
            next: () => {
                Swal.fire('Success', 'Settings saved successfully', 'success');
                this.loading = false;
                this.settingsForm.markAsPristine();
            },
            error: () => {
                Swal.fire('Error', 'Failed to save settings', 'error');
                this.loading = false;
            }
        });
    }

    changePassword(): void {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }
        if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
            Swal.fire('Warning', 'New password and confirm password do not match', 'warning');
            return;
        }

        this.passwordSaving = true;
        this.profileService.changePassword(this.passwordForm.value).subscribe({
            next: (res) => {
                this.passwordSaving = false;
                this.passwordForm.reset();
                Swal.fire('Success', res.message || 'Password changed successfully', 'success');
            },
            error: (err) => {
                this.passwordSaving = false;
                Swal.fire('Error', err?.error?.message || 'Password change failed', 'error');
            }
        });
    }

    switchTheme(theme: AppTheme): void {
        this.themeService.switchTheme(theme);
        this.selectedTheme = theme;
        this.saveProfileSettings();
    }

    switchLanguage(lang: AppLanguage): void {
        this.languageService.switchLanguage(lang);
        this.selectedLanguage = lang;
        this.saveProfileSettings();
    }

    private saveProfileSettings(): void {
        this.profileService.updateSettings({
            theme: this.selectedTheme,
            language: this.selectedLanguage
        }).subscribe();
    }
}
