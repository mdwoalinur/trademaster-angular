import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountLedgerEntry, FinancialAccount, FinancialAccountStatus } from 'src/app/models/financial-account.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-financial-account-list',
  templateUrl: './financial-account-list.component.html',
  styleUrls: ['./financial-account-list.component.css']
})
export class FinancialAccountListComponent implements OnInit {
  accounts: FinancialAccount[] = [];
  selectedAccount: FinancialAccount | null = null;
  statementEntries: AccountLedgerEntry[] = [];
  loading = false;
  statementLoading = false;
  selectedStatus: FinancialAccountStatus | '' = 'ACTIVE';
  statementStartDate = '';
  statementEndDate = '';
  statusOptions: FinancialAccountStatus[] = ['ACTIVE', 'INACTIVE', 'CLOSED'];

  constructor(
    private accountService: FinancialAccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts(this.selectedStatus).subscribe({
      next: accounts => {
        this.accounts = accounts || [];
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load financial accounts', 'error');
      }
    });
  }

  addAccount(): void {
    this.router.navigate(['/payments/accounts/add']);
  }

  editAccount(account: FinancialAccount): void {
    if (account.accountId) {
      this.router.navigate(['/payments/accounts/edit', account.accountId]);
    }
  }

  changeStatus(account: FinancialAccount, status: FinancialAccountStatus): void {
    if (!account.accountId || account.status === status) return;
    this.accountService.updateStatus(account.accountId, status).subscribe({
      next: () => {
        Swal.fire('Updated', 'Account status updated', 'success');
        this.loadAccounts();
      },
      error: err => Swal.fire('Error', err.error?.message || 'Status update failed', 'error')
    });
  }

  deleteAccount(account: FinancialAccount): void {
    if (!account.accountId) return;
    Swal.fire({
      title: 'Deactivate account?',
      text: 'Financial accounts are preserved for audit history and will be marked inactive.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deactivate'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.accountService.delete(account.accountId!).subscribe({
        next: () => {
          Swal.fire('Deactivated', 'Financial account marked inactive', 'success');
          this.loadAccounts();
        },
        error: err => Swal.fire('Error', err.error?.message || 'Deactivate failed', 'error')
      });
    });
  }

  viewStatement(account: FinancialAccount): void {
    if (!account.accountId) return;
    this.selectedAccount = account;
    this.statementLoading = true;
    this.accountService.statement(account.accountId, this.statementStartDate, this.statementEndDate).subscribe({
      next: entries => {
        this.statementEntries = entries || [];
        this.statementLoading = false;
      },
      error: err => {
        this.statementLoading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load account statement', 'error');
      }
    });
  }

  closeStatement(): void {
    this.selectedAccount = null;
    this.statementEntries = [];
  }

  formatDate(value?: string): string {
    return value ? new Date(value).toLocaleDateString() : '-';
  }

  formatCurrency(amount: number | null | undefined): string {
    const value = Number(amount || 0);
    return '৳' + value.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getTypeLabel(type?: string): string {
    return (type || '').replace(/_/g, ' ');
  }

  getStatusBadge(status?: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-success';
      case 'INACTIVE': return 'bg-warning text-dark';
      case 'CLOSED': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }
}
