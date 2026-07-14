import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment } from 'src/app/models/payment.model';
import { PaymentService } from 'src/app/services/payment.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit {
  payment: Payment | null = null;
  allocations: any[] = [];
  history: any[] = [];
  attachments: any[] = [];
  activeTab: 'overview' | 'method' | 'allocations' | 'attachments' | 'history' | 'actions' = 'overview';
  loading = false;
  uploading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/payments']);
      return;
    }
    this.loadPayment(id);
  }

  loadPayment(id: number): void {
    this.loading = true;
    this.paymentService.getById(id).subscribe({
      next: payment => {
        this.payment = payment;
        this.loading = false;
        this.loadAllocations(id);
        this.loadHistory(id);
        this.loadAttachments(id);
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load payment details', 'error');
        this.router.navigate(['/payments']);
      }
    });
  }

  loadAllocations(id: number): void {
    this.paymentService.allocations(id).subscribe({
      next: allocations => this.allocations = allocations || [],
      error: err => console.error('Failed to load payment allocations:', err)
    });
  }

  loadHistory(id: number): void {
    this.paymentService.history(id).subscribe({
      next: history => this.history = history || [],
      error: err => console.error('Failed to load payment history:', err)
    });
  }

  loadAttachments(id: number): void {
    this.paymentService.getAttachments(id).subscribe({
      next: attachments => this.attachments = attachments || [],
      error: err => console.error('Failed to load payment attachments:', err)
    });
  }

  uploadAttachment(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.payment?.paymentId) return;

    this.uploading = true;
    this.paymentService.uploadAttachment(this.payment.paymentId, file).subscribe({
      next: () => {
        this.uploading = false;
        input.value = '';
        this.loadAttachments(this.payment!.paymentId!);
        Swal.fire('Uploaded', 'Attachment added to payment record', 'success');
      },
      error: err => {
        this.uploading = false;
        input.value = '';
        Swal.fire('Error', err.error?.message || 'Attachment upload failed', 'error');
      }
    });
  }

  deleteAttachment(attachment: any): void {
    if (!this.payment?.paymentId || !attachment?.attachmentId) return;
    Swal.fire({
      title: 'Delete attachment?',
      text: 'This removes the file from this payment record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.paymentService.deleteAttachment(this.payment!.paymentId!, attachment.attachmentId).subscribe({
        next: () => {
          this.attachments = this.attachments.filter(item => item.attachmentId !== attachment.attachmentId);
          Swal.fire('Deleted', 'Attachment removed', 'success');
        },
        error: err => Swal.fire('Error', err.error?.message || 'Delete failed', 'error')
      });
    });
  }

  downloadAttachment(attachment: any): void {
    if (!this.payment?.paymentId || !attachment?.attachmentId) return;
    window.open(this.paymentService.attachmentDownloadUrl(this.payment.paymentId, attachment.attachmentId), '_blank');
  }

  returnForCorrection(): void {
    this.promptText('Return for correction', 'Comments', 'Return').then(text => {
      if (text === null || !this.payment?.paymentId) return;
      this.paymentService.returnForCorrection(this.payment.paymentId, text).subscribe({
        next: payment => this.afterAction(payment, 'Payment returned for correction'),
        error: err => Swal.fire('Error', err.error?.message || 'Return failed', 'error')
      });
    });
  }

  cancelPayment(): void {
    this.promptText('Cancel payment request', 'Reason', 'Cancel payment').then(text => {
      if (text === null || !this.payment?.paymentId) return;
      this.paymentService.cancel(this.payment.paymentId, text).subscribe({
        next: payment => this.afterAction(payment, 'Payment cancelled'),
        error: err => Swal.fire('Error', err.error?.message || 'Cancel failed', 'error')
      });
    });
  }

  createRefund(): void {
    if (!this.payment?.paymentId) return;
    Swal.fire({
      title: 'Create refund request',
      html: `
        <input id="refundAmount" type="number" min="0.01" step="0.01" class="swal2-input" placeholder="Refund amount">
        <input id="refundAccountId" type="number" min="1" class="swal2-input" placeholder="Preferred account ID (optional)">
        <textarea id="refundReason" class="swal2-textarea" placeholder="Refund reason"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Create request',
      preConfirm: () => {
        const amount = Number((document.getElementById('refundAmount') as HTMLInputElement).value);
        const accountId = Number((document.getElementById('refundAccountId') as HTMLInputElement).value);
        const reason = (document.getElementById('refundReason') as HTMLTextAreaElement).value;
        if (!amount || amount <= 0) {
          Swal.showValidationMessage('Refund amount must be greater than zero');
          return false;
        }
        return { amount, accountId: accountId || null, reason };
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      const value = result.value as { amount: number; accountId: number | null; reason: string };
      this.paymentService.createRefund(this.payment!.paymentId!, value.amount, value.accountId, value.reason).subscribe({
        next: payment => {
          Swal.fire('Created', 'Refund request created and sent for approval', 'success');
          this.router.navigate(['/payments/view', payment.paymentId]);
        },
        error: err => Swal.fire('Error', err.error?.message || 'Refund request failed', 'error')
      });
    });
  }

  createReversal(): void {
    this.promptText('Create reversal request', 'Reason', 'Create request').then(text => {
      if (text === null || !this.payment?.paymentId) return;
      this.paymentService.createReversal(this.payment.paymentId, text).subscribe({
        next: payment => {
          Swal.fire('Created', 'Reversal request created and sent for approval', 'success');
          this.router.navigate(['/payments/view', payment.paymentId]);
        },
        error: err => Swal.fire('Error', err.error?.message || 'Reversal request failed', 'error')
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/payments']);
  }

  canEditAttachments(): boolean {
    return this.payment?.transactionStatus !== 'POSTED';
  }

  canRequestRefund(): boolean {
    return this.payment?.transactionStatus === 'POSTED' && this.payment?.direction !== 'REFUND';
  }

  canRequestReversal(): boolean {
    return this.payment?.transactionStatus === 'POSTED';
  }

  formatCurrency(amount: number | null | undefined): string {
    const value = Number(amount || 0);
    return '৳' + value.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(date: Date | string | undefined): string {
    return date ? new Date(date).toLocaleString() : '-';
  }

  getBadge(status?: string): string {
    switch (status) {
      case 'APPROVED':
      case 'POSTED':
      case 'PAID': return 'bg-success';
      case 'RETURNED_FOR_CORRECTION': return 'bg-info text-dark';
      case 'PENDING_APPROVAL':
      case 'PENDING':
      case 'PARTIAL': return 'bg-warning text-dark';
      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED':
      case 'VOIDED':
      case 'REVERSED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  private promptText(title: string, label: string, confirmButtonText: string): Promise<string | null> {
    return Swal.fire({
      title,
      input: 'textarea',
      inputLabel: label,
      showCancelButton: true,
      confirmButtonText
    }).then(result => result.isConfirmed ? (result.value || '') : null);
  }

  private afterAction(payment: Payment, message: string): void {
    this.payment = payment;
    if (payment.paymentId) {
      this.loadHistory(payment.paymentId);
    }
    Swal.fire('Success', message, 'success');
  }
}
