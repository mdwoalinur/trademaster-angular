import { Component } from '@angular/core';
import { FinancialAccount } from 'src/app/models/financial-account.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import { PaymentService } from 'src/app/services/payment.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-payment-reports',
  templateUrl: './payment-reports.component.html',
  styleUrls: ['./payment-reports.component.css']
})
export class PaymentReportsComponent {
  activeReport: 'register' | 'account' | 'party' = 'register';
  startDate = '';
  endDate = '';
  status = '';
  method = '';
  accountId: number | null = null;
  partyType = 'CUSTOMER';
  partyId: number | null = null;
  accounts: FinancialAccount[] = [];
  report: any = null;
  loading = false;

  constructor(
    private paymentService: PaymentService,
    private accountService: FinancialAccountService
  ) {
    this.accountService.getAccounts('ACTIVE').subscribe({
      next: accounts => this.accounts = accounts || [],
      error: err => console.error('Failed to load accounts', err)
    });
  }

  generate(): void {
    this.loading = true;
    const request = this.activeReport === 'register'
      ? this.paymentService.paymentRegister(this.startDate || undefined, this.endDate || undefined, this.status || undefined, this.method || undefined)
      : this.activeReport === 'account'
        ? this.paymentService.accountStatement(Number(this.accountId), this.startDate || undefined, this.endDate || undefined)
        : this.paymentService.partyLedger(this.partyType, Number(this.partyId), this.startDate || undefined, this.endDate || undefined);

    if (this.activeReport === 'account' && !this.accountId) {
      this.loading = false;
      Swal.fire('Validation', 'Select an account', 'warning');
      return;
    }
    if (this.activeReport === 'party' && !this.partyId) {
      this.loading = false;
      Swal.fire('Validation', 'Enter party ID', 'warning');
      return;
    }

    request.subscribe({
      next: data => {
        this.report = data || {};
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Report generation failed', 'error');
      }
    });
  }

  exportCsv(): void {
    const rows = this.rows();
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(',')]
      .concat(rows.map(row => keys.map(key => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `payment-${this.activeReport}-report.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  printReport(): void {
    window.print();
  }

  rows(): any[] {
    if (!this.report) return [];
    return this.report.payments || this.report.entries || [];
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(value: string | Date | undefined): string {
    return value ? new Date(value).toLocaleString() : '-';
  }
}
