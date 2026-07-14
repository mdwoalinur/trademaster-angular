import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuditLog } from 'src/app/models/audit-log.model';
import { AuditLogService } from 'src/app/services/audit-log.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-audit-log-list',
  templateUrl: './audit-log-list.component.html',
  styleUrls: ['./audit-log-list.component.css']
})
export class AuditLogListComponent implements OnInit {
  logs: AuditLog[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterUserId = '';
  filterAction = '';
  filterEntityType = '';
  filterSearch = '';

  actions = [
    'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT', 'APPROVE_POST',
    'POST', 'CANCEL', 'RETURN_FOR_CORRECTION', 'REQUEST_PAYMENT', 'RECEIVE',
    'CONFIRM', 'STATUS_CHANGE', 'IMPORT', 'EXPORT', 'MATCH', 'UNMATCH',
    'RECONCILE', 'REFUND', 'REVERSE', 'LOGIN_SUCCESS', 'LOGIN_FAILED',
    'PASSWORD_CHANGE_OTP_REQUEST', 'PASSWORD_CHANGE_CONFIRMED'
  ];

  entityTypes = [
    'Auth', 'Product', 'ProductVariation', 'Category', 'Unit', 'Warehouse',
    'Customer', 'Supplier', 'Sale', 'SaleItem', 'SaleReturn', 'Purchase',
    'PurchaseReturn', 'Inventory', 'StockMovement', 'StockTransfer',
    'StockAdjustment', 'LowStockAlert', 'Payment', 'PaymentAttachment',
    'FinancialAccount', 'BankStatementEntry', 'Expense', 'ExpenseCategory',
    'WastageRecord', 'WastageCategory', 'User', 'Role', 'SystemSetting',
    'Notification'
  ];

  constructor(
    private auditLogService: AuditLogService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    const filters = {
      userId: this.filterUserId || null,
      action: this.filterAction || null,
      entityType: this.filterEntityType || null,
      search: this.filterSearch || null
    };

    this.auditLogService.getLogs(this.currentPage - 1, this.pageSize, filters).subscribe({
      next: (res) => {
        this.logs = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire(
          this.translate.instant('COMMON.ERROR'),
          this.translate.instant('AUDIT.MESSAGES.LOAD_FAILED'),
          'error'
        );
      }
    });
  }

  resetFilters(): void {
    this.filterUserId = '';
    this.filterAction = '';
    this.filterEntityType = '';
    this.filterSearch = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  viewDetails(log: AuditLog): void {
    this.router.navigate(['/audit-logs/view', log.logId]);
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

  exportCsv(): void {
    const filters = {
      userId: this.filterUserId || null,
      action: this.filterAction || null,
      entityType: this.filterEntityType || null,
      search: this.filterSearch || null
    };
    const exportSize = Math.max(this.totalElements || this.pageSize, this.pageSize);
    this.auditLogService.getLogs(0, exportSize, filters).subscribe({
      next: (res) => this.downloadCsv(res.content || []),
      error: () => Swal.fire(
        this.translate.instant('COMMON.ERROR'),
        this.translate.instant('AUDIT.MESSAGES.EXPORT_FAILED'),
        'error'
      )
    });
  }

  firstPage(): void {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.loadLogs();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  lastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.loadLogs();
    }
  }

  private downloadCsv(rows: AuditLog[]): void {
    const headers = ['Log ID', 'User ID', 'Username', 'Action', 'Entity Type', 'Entity ID', 'Status', 'IP Address', 'Time'];
    const lines = rows.map((log) => [
      log.logId,
      log.userId,
      log.username,
      log.action,
      log.entityType,
      log.entityId,
      this.getOperationStatus(log),
      log.ipAddress || '',
      log.createdAt || ''
    ].map((value) => this.csvCell(value)).join(','));
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private csvCell(value: unknown): string {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }
}
