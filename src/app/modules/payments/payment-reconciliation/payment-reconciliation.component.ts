import { Component, OnInit } from '@angular/core';
import { FinancialAccount } from 'src/app/models/financial-account.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import { PaymentService } from 'src/app/services/payment.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-payment-reconciliation',
  templateUrl: './payment-reconciliation.component.html',
  styleUrls: ['./payment-reconciliation.component.css']
})
export class PaymentReconciliationComponent implements OnInit {
  accounts: FinancialAccount[] = [];
  entries: any[] = [];
  summary: any = {};
  selectedAccountId: number | null = null;
  status = '';
  loading = false;
  importing = false;

  constructor(
    private paymentService: PaymentService,
    private accountService: FinancialAccountService
  ) {}

  ngOnInit(): void {
    this.accountService.getAccounts('ACTIVE').subscribe({
      next: accounts => this.accounts = accounts || [],
      error: err => console.error('Failed to load accounts', err)
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.paymentService.reconciliationEntries(this.selectedAccountId || undefined, this.status || undefined).subscribe({
      next: entries => {
        this.entries = entries || [];
        this.loading = false;
        this.loadSummary();
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load reconciliation entries', 'error');
      }
    });
  }

  loadSummary(): void {
    this.paymentService.reconciliationSummary(this.selectedAccountId || undefined).subscribe({
      next: summary => this.summary = summary || {},
      error: err => console.error('Failed to load reconciliation summary', err)
    });
  }

  importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedAccountId) {
      Swal.fire('Validation', 'Select a bank account before importing statement CSV', 'warning');
      input.value = '';
      return;
    }
    this.importing = true;
    this.paymentService.importStatement(this.selectedAccountId, file).subscribe({
      next: result => {
        this.importing = false;
        input.value = '';
        Swal.fire('Imported', `Imported ${result.imported || 0} rows, skipped ${result.skipped || 0}.`, 'success');
        this.load();
      },
      error: err => {
        this.importing = false;
        input.value = '';
        Swal.fire('Error', err.error?.message || 'Statement import failed', 'error');
      }
    });
  }

  match(entry: any): void {
    Swal.fire({
      title: 'Match payment',
      input: 'number',
      inputLabel: 'Posted Payment ID',
      inputPlaceholder: 'Enter payment ID',
      showCancelButton: true,
      confirmButtonText: 'Match'
    }).then(result => {
      if (!result.isConfirmed) return;
      const paymentId = Number(result.value);
      if (!paymentId) {
        Swal.fire('Validation', 'Payment ID is required', 'warning');
        return;
      }
      this.paymentService.matchStatementEntry(entry.statementEntryId, paymentId, 'Manual match from reconciliation screen').subscribe({
        next: () => {
          Swal.fire('Matched', 'Statement entry matched to payment', 'success');
          this.load();
        },
        error: err => Swal.fire('Error', err.error?.message || 'Match failed', 'error')
      });
    });
  }

  reconcile(entry: any): void {
    this.paymentService.reconcileStatementEntry(entry.statementEntryId, 'Reconciled from UI').subscribe({
      next: () => {
        Swal.fire('Reconciled', 'Payment is marked reconciled', 'success');
        this.load();
      },
      error: err => Swal.fire('Error', err.error?.message || 'Reconcile failed', 'error')
    });
  }

  unmatch(entry: any): void {
    this.paymentService.unmatchStatementEntry(entry.statementEntryId).subscribe({
      next: () => {
        Swal.fire('Unmatched', 'Statement entry unmatched', 'success');
        this.load();
      },
      error: err => Swal.fire('Error', err.error?.message || 'Unmatch failed', 'error')
    });
  }

  amount(entry: any): number {
    return Number(entry.creditAmount || 0) - Number(entry.debitAmount || 0);
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
