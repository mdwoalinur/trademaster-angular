import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from 'src/app/services/purchase.service';
import { ProductService } from 'src/app/services/product.service';
import { Purchase } from 'src/app/models/purchase.model';
import { Product } from 'src/app/models/product.model';
import { Payment } from 'src/app/models/payment.model';
import { FinancialAccount } from 'src/app/models/financial-account.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-purchase-view',
  templateUrl: './purchase-view.component.html',
  styleUrls: ['./purchase-view.component.css']
})
export class PurchaseViewComponent implements OnInit {
  purchase: Purchase | null = null;
  products: Product[] = [];
  purchasePayments: Payment[] = [];
  paymentSummary: any = null;
  activeAccounts: FinancialAccount[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService,
    private productService: ProductService,
    private accountService: FinancialAccountService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadAccounts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadPurchase(+id);
    else this.router.navigate(['/purchases']);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: products => this.products = products,
      error: err => console.error('Failed to load products:', err)
    });
  }

  loadAccounts(): void {
    this.accountService.getAccounts('ACTIVE').subscribe({
      next: accounts => this.activeAccounts = accounts || [],
      error: err => console.error('Failed to load financial accounts:', err)
    });
  }

  loadPurchase(id: number): void {
    this.loading = true;
    this.purchaseService.getPurchaseById(id).subscribe({
      next: (data) => {
        this.purchase = data;
        this.loading = false;
        this.loadPurchasePayments(id);
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load purchase details', 'error');
        this.router.navigate(['/purchases']);
      }
    });
  }

  loadPurchasePayments(id: number): void {
    this.purchaseService.getPaymentSummary(id).subscribe({
      next: summary => this.paymentSummary = summary,
      error: err => console.error('Failed to load purchase payment summary:', err)
    });
    this.purchaseService.getPayments(id).subscribe({
      next: payments => this.purchasePayments = payments || [],
      error: err => console.error('Failed to load purchase payments:', err)
    });
  }

  editPurchase(): void {
    if (this.purchase?.purchaseId) {
      this.router.navigate(['/purchases/edit', this.purchase.purchaseId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/purchases']);
  }

  formatCurrency(amount: number): string {
    const value = Number(amount || 0);
    return '৳' + value.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(date: Date | string | undefined): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }

  getProduct(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
  }

  getProductName(productId: number): string {
    return this.getProduct(productId)?.productName || `Product #${productId}`;
  }

  getProductSku(productId: number): string {
    const product = this.getProduct(productId);
    return product?.sku || product?.productCode || '';
  }

  getProductImageUrl(productId: number): string {
    return this.getProduct(productId)?.imageUrl || '';
  }

  getStatusBadge(status: string): string {
    switch(status) {
      case 'RECEIVED': return 'bg-success';
      case 'PENDING': return 'bg-warning';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  canMarkAsReceived(): boolean {
    return this.purchase?.status === 'PENDING';
  }

  canCancel(): boolean {
    return this.purchase?.status === 'PENDING';
  }

  canRequestPayment(): boolean {
    const due = Number(this.paymentSummary?.dueAmount ?? this.purchase?.dueAmount ?? this.purchase?.totalAmount ?? 0);
    return this.purchase?.status === 'RECEIVED' && due > 0;
  }

  async requestPayment(): Promise<void> {
    const purchaseId = this.purchase?.purchaseId;
    if (!purchaseId) return;

    const due = Number(this.paymentSummary?.dueAmount ?? this.purchase?.dueAmount ?? this.purchase?.totalAmount ?? 0);
    const accountOptions = this.activeAccounts
      .map(account => `<option value="${account.accountId}">${account.accountCode} - ${account.accountName}</option>`)
      .join('');

    const { value: formValues } = await Swal.fire({
      title: 'Request Purchase Payment',
      html: `
        <label class="swal2-label text-start d-block">Amount</label>
        <input id="paymentAmount" type="number" min="0.01" step="0.01" class="swal2-input" value="${due}">
        <label class="swal2-label text-start d-block">Preferred Account</label>
        <select id="paymentAccountId" class="swal2-select">
          <option value="">Select during approval</option>
          ${accountOptions}
        </select>
        <textarea id="paymentNotes" class="swal2-textarea" placeholder="Payment notes"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit for Approval',
      preConfirm: () => {
        const amount = Number((document.getElementById('paymentAmount') as HTMLInputElement).value);
        const accountValue = (document.getElementById('paymentAccountId') as HTMLSelectElement).value;
        const notes = (document.getElementById('paymentNotes') as HTMLTextAreaElement).value;
        if (!amount || amount <= 0) {
          Swal.showValidationMessage('Amount must be greater than zero');
          return false;
        }
        if (amount > due) {
          Swal.showValidationMessage('Payment request cannot exceed current due amount');
          return false;
        }
        return {
          amount,
          accountId: accountValue ? Number(accountValue) : undefined,
          notes
        };
      }
    });

    if (!formValues) return;

    this.purchaseService.requestPayment(purchaseId, formValues).subscribe({
      next: () => {
        Swal.fire('Submitted', 'Purchase payment request submitted for approval', 'success');
        this.loadPurchase(purchaseId);
      },
      error: err => Swal.fire('Error', err.error?.message || 'Payment request failed', 'error')
    });
  }

  async markAsReceived(): Promise<void> {
    // Capture the ID once, safely
    const purchaseId = this.purchase?.purchaseId;
    if (!purchaseId) return;

    const { value: formValues } = await Swal.fire({
      title: 'Mark as Received',
      html: '<input id="deliveryDate" type="date" class="swal2-input"><textarea id="notes" class="swal2-textarea" placeholder="Notes"></textarea>',
      preConfirm: () => {
        const deliveryDate = (document.getElementById('deliveryDate') as HTMLInputElement).value;
        const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;
        if (!deliveryDate) Swal.showValidationMessage('Delivery date required');
        return { deliveryDate, notes };
      }
    });

    if (formValues) {
      this.purchaseService.markAsReceived(purchaseId, new Date(formValues.deliveryDate), formValues.notes).subscribe({
        next: () => {
          Swal.fire('Success', 'Purchase marked as received and stock updated', 'success');
          this.loadPurchase(purchaseId);
        },
        error: () => Swal.fire('Error', 'Failed to mark as received', 'error')
      });
    }
  }

  async cancelPurchase(): Promise<void> {
    const purchaseId = this.purchase?.purchaseId;
    if (!purchaseId) return;

    const result = await Swal.fire({
      title: 'Cancel Purchase?',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it'
    });

    if (result.isConfirmed) {
      this.purchaseService.cancelPurchase(purchaseId).subscribe({
        next: () => {
          Swal.fire('Cancelled', 'Purchase cancelled', 'success');
          this.loadPurchase(purchaseId);
        },
        error: () => Swal.fire('Error', 'Failed to cancel purchase', 'error')
      });
    }
  }
}
