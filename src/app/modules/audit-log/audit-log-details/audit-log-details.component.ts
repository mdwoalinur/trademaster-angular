import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuditLog } from 'src/app/models/audit-log.model';
import { AuditLogService } from 'src/app/services/audit-log.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-audit-log-details',
  templateUrl: './audit-log-details.component.html',
  styleUrls: ['./audit-log-details.component.css']
})
export class AuditLogDetailsComponent implements OnInit {
  log: AuditLog | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auditLogService: AuditLogService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      Swal.fire(
        this.translate.instant('COMMON.ERROR'),
        this.translate.instant('AUDIT.MESSAGES.INVALID_ID'),
        'error'
      );
      this.router.navigate(['/audit-logs']);
      return;
    }
    this.loadLog(id);
  }

  loadLog(id: number): void {
    this.loading = true;
    this.auditLogService.getById(id).subscribe({
      next: (data) => {
        this.log = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire(
          this.translate.instant('COMMON.ERROR'),
          this.translate.instant('AUDIT.MESSAGES.DETAILS_FAILED'),
          'error'
        );
        this.router.navigate(['/audit-logs']);
      }
    });
  }

  formatValue(value: string | undefined): string {
    if (!value) return '-';
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }

  goBack(): void {
    this.router.navigate(['/audit-logs']);
  }

  getActionLabelKey(action: string): string {
    return `AUDIT.ACTIONS.${action}`;
  }

  getOperationStatus(log: AuditLog): 'SUCCESS' | 'FAILED' {
    try {
      const parsed = JSON.parse(log.newValue || '{}');
      return parsed?.success === false ? 'FAILED' : 'SUCCESS';
    } catch {
      return log.action === 'LOGIN_FAILED' ? 'FAILED' : 'SUCCESS';
    }
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'CREATE':
      case 'APPROVE':
      case 'APPROVE_POST':
      case 'POST':
      case 'RECEIVE':
      case 'CONFIRM':
      case 'RECONCILE':
      case 'LOGIN_SUCCESS':
        return 'bg-success';
      case 'UPDATE':
      case 'STATUS_CHANGE':
      case 'SUBMIT':
      case 'REQUEST_PAYMENT':
      case 'IMPORT':
      case 'MATCH':
      case 'UNMATCH':
        return 'bg-info text-dark';
      case 'DELETE':
      case 'REJECT':
      case 'CANCEL':
      case 'REFUND':
      case 'REVERSE':
      case 'LOGIN_FAILED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
