import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialAccount } from 'src/app/models/financial-account.model';
import { Payment } from 'src/app/models/payment.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import { PaymentService } from 'src/app/services/payment.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-pending-payment-approvals',
  templateUrl: './pending-payment-approvals.component.html',
  styleUrls: ['./pending-payment-approvals.component.css']
})
export class PendingPaymentApprovalsComponent implements OnInit {
  payments: Payment[] = [];
  activeAccounts: FinancialAccount[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  constructor(
    private paymentService: PaymentService,
    private accountService: FinancialAccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadActiveAccounts();
    this.loadPendingApprovals();
  }

  get loadedPageTotal(): number {
    return this.payments.reduce((sum, payment) => sum + Number(payment.requestedAmount || payment.amount || 0), 0);
  }

  loadActiveAccounts(): void {
    this.accountService.getAccounts('ACTIVE').subscribe({
      next: accounts => this.activeAccounts = accounts || [],
      error: err => console.error('Failed to load financial accounts:', err)
    });
  }

  loadPendingApprovals(): void {
    this.loading = true;
    this.paymentService.getPendingApprovals(this.currentPage - 1, this.pageSize).subscribe({
      next: res => {
        this.payments = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load pending approvals', 'error');
      }
    });
  }

  viewPayment(payment: Payment): void {
    if (payment.paymentId) {
      this.router.navigate(['/payments/view', payment.paymentId]);
    }
  }

  approvePayment(payment: Payment): void {
    if (!payment.paymentId) return;
    const amount = Number(payment.requestedAmount || payment.amount || 0);
    const accountOptions = this.activeAccounts
      .map(account => `<option value="${account.accountId}" ${account.accountId === payment.accountId ? 'selected' : ''}>${account.accountCode} - ${account.accountName}</option>`)
      .join('');
    const destinationOptions = `<option value="">Not required</option>${accountOptions}`;

    Swal.fire({
      title: 'Approve & Post Payment?',
      html: `
        <div class="text-start small mb-2">
          <strong>${payment.voucherNo || 'Draft voucher'}</strong><br>
          ${payment.paymentType} / ${payment.direction || '-'} / ${payment.referenceNo || payment.referenceId}
        </div>
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
        <textarea id="approvalComments" class="swal2-textarea" placeholder="Approval comments"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve & Post',
      preConfirm: () => {
        const approvedAmount = Number((document.getElementById('approvedAmount') as HTMLInputElement).value);
        const accountId = Number((document.getElementById('postingAccountId') as HTMLSelectElement).value);
        const destinationElement = document.getElementById('destinationAccountId') as HTMLSelectElement | null;
        const destinationAccountId = destinationElement?.value ? Number(destinationElement.value) : undefined;
        const comments = (document.getElementById('approvalComments') as HTMLTextAreaElement).value;

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

        return { approvedAmount, accountId, destinationAccountId, comments };
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      const value = result.value as { approvedAmount: number; accountId: number; destinationAccountId?: number; comments?: string };
      this.paymentService.approveAndPost(
        payment.paymentId!,
        value.approvedAmount,
        value.accountId,
        value.destinationAccountId,
        value.comments || 'Approved from pending approvals'
      ).subscribe({
        next: () => {
          Swal.fire('Posted', 'Payment approved and posted', 'success');
          this.loadPendingApprovals();
        },
        error: err => Swal.fire('Error', err.error?.message || 'Approval failed', 'error')
      });
    });
  }

  rejectPayment(payment: Payment): void {
    if (!payment.paymentId) return;
    Swal.fire({
      title: 'Reject Payment?',
      input: 'textarea',
      inputLabel: 'Reason',
      inputPlaceholder: 'Write rejection reason',
      inputValidator: value => value ? null : 'Rejection reason is required',
      showCancelButton: true,
      confirmButtonText: 'Reject'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.paymentService.reject(payment.paymentId!, result.value).subscribe({
        next: () => {
          Swal.fire('Rejected', 'Payment request rejected', 'success');
          this.loadPendingApprovals();
        },
        error: err => Swal.fire('Error', err.error?.message || 'Reject failed', 'error')
      });
    });
  }

  firstPage(): void { if (this.currentPage !== 1) { this.currentPage = 1; this.loadPendingApprovals(); } }
  previousPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadPendingApprovals(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadPendingApprovals(); } }
  lastPage(): void { if (this.currentPage !== this.totalPages) { this.currentPage = this.totalPages; this.loadPendingApprovals(); } }

  formatCurrency(amount: number | null | undefined): string {
    const value = Number(amount || 0);
    return '৳' + value.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(date: Date | string | undefined): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }

  getStatusBadge(status?: string): string {
    switch (status) {
      case 'PENDING_APPROVAL': return 'bg-warning text-dark';
      case 'POSTED':
      case 'APPROVED': return 'bg-success';
      case 'REJECTED':
      case 'FAILED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
