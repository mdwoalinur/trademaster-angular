import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import Swal from './sweet-alert.helper';

export interface AlertConfirmation {
  titleKey: string;
  messageKey: string;
  confirmKey?: string;
  cancelKey?: string;
  params?: Record<string, unknown>;
  icon?: 'warning' | 'question' | 'info';
}

@Injectable({ providedIn: 'root' })
export class SweetAlertService {
  private activeNotice = '';

  constructor(private translate: TranslateService) {}

  success(messageKey: string, params?: Record<string, unknown>): Promise<SweetAlertResult> {
    return this.notice('success', 'ALERT.SUCCESS_TITLE', messageKey, params);
  }

  error(error: unknown, fallbackKey = 'ALERT.GENERIC_ERROR'): Promise<SweetAlertResult> {
    const backendMessage = this.backendMessage(error);
    return this.notice('error', 'ALERT.ERROR_TITLE', backendMessage || fallbackKey, undefined, !!backendMessage);
  }

  warning(messageKey: string, params?: Record<string, unknown>): Promise<SweetAlertResult> {
    return this.notice('warning', 'ALERT.WARNING_TITLE', messageKey, params);
  }

  info(messageKey: string, params?: Record<string, unknown>): Promise<SweetAlertResult> {
    return this.notice('info', 'ALERT.INFO_TITLE', messageKey, params);
  }

  confirm(config: AlertConfirmation): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: config.icon || 'warning',
      title: this.t(config.titleKey, config.params),
      text: this.t(config.messageKey, config.params),
      showCancelButton: true,
      confirmButtonText: this.t(config.confirmKey || 'ALERT.CONFIRM'),
      cancelButtonText: this.t(config.cancelKey || 'ALERT.CANCEL'),
      allowOutsideClick: false,
      allowEscapeKey: true,
      showLoaderOnConfirm: false
    });
  }

  delete(entityKey: string, name?: string): Promise<SweetAlertResult> {
    return this.confirm({
      titleKey: 'ALERT.DELETE_TITLE',
      messageKey: name ? 'ALERT.DELETE_NAMED_MESSAGE' : 'ALERT.DELETE_MESSAGE',
      confirmKey: 'ALERT.DELETE_CONFIRM',
      params: { entity: this.t(entityKey), name: name || '' }
    });
  }

  approve(messageKey = 'ALERT.APPROVE_MESSAGE', params?: Record<string, unknown>): Promise<SweetAlertResult> {
    return this.confirm({
      titleKey: 'ALERT.APPROVE_TITLE',
      messageKey,
      confirmKey: 'ALERT.APPROVE_CONFIRM',
      params,
      icon: 'question'
    });
  }

  reject(messageKey = 'ALERT.REJECT_MESSAGE', params?: Record<string, unknown>): Promise<SweetAlertResult> {
    return this.confirm({
      titleKey: 'ALERT.REJECT_TITLE',
      messageKey,
      confirmKey: 'ALERT.REJECT_CONFIRM',
      params
    });
  }

  logout(): Promise<SweetAlertResult> {
    return this.confirm({
      titleKey: 'ALERT.LOGOUT_TITLE',
      messageKey: 'ALERT.LOGOUT_MESSAGE',
      confirmKey: 'ALERT.LOGOUT_CONFIRM',
      icon: 'question'
    });
  }

  fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
    return Swal.fire(options);
  }

  showValidationMessage(messageKey: string, params?: Record<string, unknown>): void {
    Swal.showValidationMessage(this.t(messageKey, params));
  }

  private notice(
    icon: 'success' | 'error' | 'warning' | 'info',
    titleKey: string,
    message: string,
    params?: Record<string, unknown>,
    literalMessage = false
  ): Promise<SweetAlertResult> {
    const text = literalMessage ? message : this.t(message, params);
    const signature = `${icon}|${titleKey}|${text}`;
    if (this.activeNotice === signature && Swal.isVisible()) {
      return Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
    }
    this.activeNotice = signature;
    return Swal.fire({ icon, title: this.t(titleKey), text }).finally(() => {
      if (this.activeNotice === signature) this.activeNotice = '';
    });
  }

  private backendMessage(error: any): string {
    const candidate = error?.error?.message || error?.error?.error || error?.message;
    return typeof candidate === 'string' && candidate.trim() ? candidate.trim().slice(0, 500) : '';
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}
