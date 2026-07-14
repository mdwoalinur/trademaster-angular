
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment.service';
import { Payment } from 'src/app/models/payment.model';
import { FinancialAccount } from 'src/app/models/financial-account.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  searchKeyword = '';
  selectedType = '';
  selectedStatus = '';
  typeOptions = ['SALE', 'PURCHASE', 'EXPENSE', 'POS', 'CUSTOMER_ADVANCE', 'SUPPLIER_ADVANCE', 'REFUND', 'ADJUSTMENT', 'ACCOUNT_TRANSFER'];
  statusOptions = ['DRAFT', 'PENDING_APPROVAL', 'RETURNED_FOR_CORRECTION', 'APPROVED', 'REJECTED'];
  activeAccounts: FinancialAccount[] = [];
  Math = Math;

  constructor(
    private paymentService: PaymentService,
    private accountService: FinancialAccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadActiveAccounts();
  }

  loadActiveAccounts(): void {
    this.accountService.getAccounts('ACTIVE').subscribe({
      next: accounts => this.activeAccounts = accounts || [],
      error: err => console.error('Failed to load financial accounts:', err)
    });
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getPayments(
      this.currentPage - 1,
      this.pageSize,
      this.selectedType || undefined,
      this.selectedStatus || undefined,
      this.searchKeyword || undefined
    ).subscribe({
      next: (res) => {
        this.payments = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load payments', 'error');
      }
    });
  }

  onSearch(): void { this.currentPage = 1; this.loadPayments(); }
  onFilterChange(): void { this.currentPage = 1; this.loadPayments(); }
  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadPayments();
  }

  firstPage(): void { if (this.currentPage !== 1) { this.currentPage = 1; this.loadPayments(); } }
  previousPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadPayments(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadPayments(); } }
  lastPage(): void { if (this.currentPage !== this.totalPages) { this.currentPage = this.totalPages; this.loadPayments(); } }

  addPayment(): void { this.router.navigate(['/payments/add']); }
  editPayment(id: number): void { this.router.navigate(['/payments/edit', id]); }
  viewPayment(id: number): void { this.router.navigate(['/payments/view', id]); }

  submitPayment(payment: Payment): void {
    if (!payment.paymentId) return;
    this.paymentService.submit(payment.paymentId).subscribe({
      next: () => {
        Swal.fire('Submitted', 'Payment request submitted for approval', 'success');
        this.loadPayments();
      },
      error: (err) => Swal.fire('Error', err.error?.message || 'Submit failed', 'error')
    });
  }

  approvePayment(payment: Payment): void {
    if (!payment.paymentId) return;
    const amount = Number(payment.requestedAmount || payment.amount || 0);
    const accountOptions = this.activeAccounts
      .map(account => `<option value="${account.accountId}">${account.accountCode} - ${account.accountName}</option>`)
      .join('');
    const destinationOptions = `<option value="">Not required</option>${accountOptions}`;
    Swal.fire({
      title: 'Approve & Post Payment?',
      html: `
        <label class="swal2-label text-start d-block">Approved Amount</label>
        <input id="approvedAmount" type="number" min="0.01" step="0.01" class="swal2-input" value="${amount}">
        <label class="swal2-label text-start d-block">Posting Account</label>
        <select id="postingAccountId" class="swal2-select">
          <option value="">Select account</option>
          ${accountOptions}
        </select>
        ${payment.direction === 'TRANSFER' ? `
          <label class="swal2-label text-start d-block">Destination Account</label>
          <select id="destinationAccountId" class="swal2-select">
            ${destinationOptions}
          </select>
        ` : ''}
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve & Post',
      preConfirm: () => {
        const approvedAmount = Number((document.getElementById('approvedAmount') as HTMLInputElement).value);
        const accountId = Number((document.getElementById('postingAccountId') as HTMLSelectElement).value);
        const destinationElement = document.getElementById('destinationAccountId') as HTMLSelectElement | null;
        const destinationAccountId = destinationElement?.value ? Number(destinationElement.value) : undefined;

        if (!approvedAmount || approvedAmount <= 0) {
          Swal.showValidationMessage('Approved amount must be greater than zero');
          return false;
        }
        if (!accountId) {
          Swal.showValidationMessage('Posting account is required');
          return false;
        }
        if (payment.direction === 'TRANSFER' && !destinationAccountId) {
          Swal.showValidationMessage('Destination account is required for transfer');
          return false;
        }
        if (destinationAccountId && destinationAccountId === accountId) {
          Swal.showValidationMessage('Source and destination accounts must be different');
          return false;
        }

        return { approvedAmount, accountId, destinationAccountId };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const value = result.value as { approvedAmount: number; accountId: number; destinationAccountId?: number };
        this.paymentService.approveAndPost(
          payment.paymentId!,
          value.approvedAmount,
          value.accountId,
          value.destinationAccountId,
          'Approved from payment list'
        ).subscribe({
          next: () => {
            Swal.fire('Posted', 'Payment approved and posted', 'success');
            this.loadPayments();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Approval failed', 'error')
        });
      }
    });
  }

  rejectPayment(payment: Payment): void {
    if (!payment.paymentId) return;
    Swal.fire({
      title: 'Reject Payment?',
      input: 'textarea',
      inputLabel: 'Reason',
      inputPlaceholder: 'Write rejection reason',
      showCancelButton: true,
      confirmButtonText: 'Reject'
    }).then(result => {
      if (result.isConfirmed) {
        this.paymentService.reject(payment.paymentId!, result.value || '').subscribe({
          next: () => {
            Swal.fire('Rejected', 'Payment request rejected', 'success');
            this.loadPayments();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Reject failed', 'error')
        });
      }
    });
  }

  deletePayment(id: number): void {
    Swal.fire({
      title: 'Cancel Draft Payment?',
      text: 'The draft will be marked cancelled and preserved for audit history.',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.paymentService.delete(id).subscribe({
          next: () => {
            Swal.fire('Cancelled', 'Draft payment cancelled', 'success');
            this.loadPayments();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Cancel failed', 'error')
        });
      }
    });
  }

  formatCurrency(amount: number): string {
    return '৳' + Number(amount || 0).toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(date: Date | string): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }

  canDeletePayment(payment: Payment): boolean {
    return payment.approvalStatus === 'DRAFT' && (!payment.transactionStatus || payment.transactionStatus === 'PENDING');
  }

  getTypeBadge(type: string): string {
    switch(type) {
      case 'SALE': return 'bg-primary';
      case 'PURCHASE': return 'bg-warning';
      case 'EXPENSE': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getStatusBadge(status: string): string {
    switch(status) {
      case 'PAID': return 'bg-success';
      case 'PARTIAL': return 'bg-warning';
      case 'UNPAID': return 'bg-danger';
      case 'REFUNDED': return 'bg-info';
      case 'DRAFT': return 'bg-secondary';
      case 'PENDING_APPROVAL': return 'bg-warning';
      case 'RETURNED_FOR_CORRECTION': return 'bg-info';
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'POSTED': return 'bg-success';
      case 'PENDING': return 'bg-warning';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
