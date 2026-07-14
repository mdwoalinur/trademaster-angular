import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'src/app/services/sweet-alert.helper';
import { Purchase } from 'src/app/models/purchase.model';
import { PurchaseReturn, ReturnablePurchaseItem } from 'src/app/models/purchase-return.model';
import { PurchaseReturnService } from 'src/app/services/purchase-return.service';
import { PurchaseService } from 'src/app/services/purchase.service';

@Component({
  selector: 'app-purchase-return-form',
  templateUrl: './purchase-return-form.component.html',
  styleUrls: ['./purchase-return-form.component.css']
})
export class PurchaseReturnFormComponent implements OnInit {
  id?: number;
  isEdit = false;
  loading = false;
  submitting = false;
  purchases: Purchase[] = [];
  selectedPurchase?: Purchase;
  returnableItems: ReturnablePurchaseItem[] = [];
  returnDate = new Date().toISOString().slice(0, 10);
  reason = '';
  notes = '';
  subtotal = 0;
  totalTax = 0;
  totalDiscount = 0;
  totalAmount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService,
    private purchaseReturnService: PurchaseReturnService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id') || 0) || undefined;
    this.isEdit = !!this.id;
    this.loadPurchases();
    if (this.isEdit) this.loadReturn();
  }

  loadPurchases(): void {
    this.purchaseService.getPurchases(0, 500, 'RECEIVED', '').subscribe({
      next: res => this.purchases = res.content || [],
      error: () => Swal.fire('Error', 'Failed to load received purchases', 'error')
    });
  }

  loadReturn(): void {
    if (!this.id) return;
    this.loading = true;
    this.purchaseReturnService.getById(this.id).subscribe({
      next: data => {
        if (data.status !== 'DRAFT') {
          Swal.fire('Not Editable', 'Confirmed purchase returns cannot be edited.', 'warning');
          this.router.navigate(['/purchase-returns/view', data.id]);
          return;
        }
        this.returnDate = data.returnDate;
        this.reason = data.reason;
        this.notes = data.notes || '';
        this.onPurchaseChange(data.originalPurchaseId, data);
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load purchase return', 'error');
      }
    });
  }

  onPurchaseChange(purchaseIdValue: any, existing?: PurchaseReturn): void {
    const purchaseId = Number(purchaseIdValue);
    this.selectedPurchase = this.purchases.find(p => p.purchaseId === purchaseId);
    if (!purchaseId) return;
    this.loading = true;
    this.purchaseReturnService.getReturnableItems(purchaseId).subscribe({
      next: items => {
        this.returnableItems = items.map(item => {
          const existingItem = existing?.items?.find(i => i.purchaseItemId === item.purchaseItemId);
          return {
            ...item,
            returnQuantity: existingItem?.quantity || 0,
            reason: existingItem?.reason || existing?.reason || ''
          };
        });
        if (!this.selectedPurchase) {
          this.purchaseService.getPurchaseById(purchaseId).subscribe(p => this.selectedPurchase = p);
        }
        this.calculateTotals();
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load returnable items', 'error');
      }
    });
  }

  calculateTotals(): void {
    this.subtotal = 0;
    this.totalTax = 0;
    this.totalDiscount = 0;
    this.returnableItems.forEach(item => {
      const qty = Number(item.returnQuantity || 0);
      const lineSubtotal = qty * Number(item.unitPrice || 0);
      const lineTax = lineSubtotal * Number(item.taxRate || 0) / 100;
      const lineDiscount = 0;
      this.subtotal += lineSubtotal;
      this.totalTax += lineTax;
      this.totalDiscount += lineDiscount;
    });
    this.totalAmount = this.subtotal + this.totalTax - this.totalDiscount;
  }

  lineTotal(item: ReturnablePurchaseItem): number {
    const subtotal = Number(item.returnQuantity || 0) * Number(item.unitPrice || 0);
    return subtotal + subtotal * Number(item.taxRate || 0) / 100;
  }

  save(confirmAfterSave = false): void {
    if (!this.selectedPurchase?.purchaseId) {
      Swal.fire('Validation Error', 'Please select original purchase', 'warning');
      return;
    }
    if (!this.reason.trim()) {
      Swal.fire('Validation Error', 'Return reason is required', 'warning');
      return;
    }
    const selectedItems = this.returnableItems.filter(i => Number(i.returnQuantity || 0) > 0);
    if (!selectedItems.length) {
      Swal.fire('Validation Error', 'At least one item must have return quantity greater than 0', 'warning');
      return;
    }
    const invalid = selectedItems.find(i => Number(i.returnQuantity || 0) > Number(i.returnableQuantity || 0));
    if (invalid) {
      Swal.fire('Validation Error', `Return quantity exceeds returnable quantity for ${invalid.productName}`, 'warning');
      return;
    }

    const payload: PurchaseReturn = {
      originalPurchaseId: this.selectedPurchase.purchaseId,
      returnDate: this.returnDate,
      reason: this.reason,
      notes: this.notes,
      items: selectedItems.map(item => ({
        purchaseItemId: item.purchaseItemId,
        productId: item.productId,
        quantity: Number(item.returnQuantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        taxRate: Number(item.taxRate || 0),
        discountAmount: 0,
        reason: item.reason || this.reason
      }))
    };
    this.submitting = true;
    const request = this.isEdit && this.id
      ? this.purchaseReturnService.update(this.id, payload)
      : this.purchaseReturnService.create(payload);
    request.subscribe({
      next: saved => {
        if (confirmAfterSave && saved.id) {
          this.purchaseReturnService.confirm(saved.id).subscribe({
            next: () => {
              Swal.fire('Confirmed', 'Purchase return confirmed and stock decreased.', 'success');
              this.router.navigate(['/purchase-returns']);
            },
            error: err => {
              this.submitting = false;
              Swal.fire('Saved as Draft', err.error?.message || 'Draft saved, but confirm failed', 'warning');
            }
          });
        } else {
          Swal.fire('Saved', 'Purchase return saved as draft.', 'success');
          this.router.navigate(['/purchase-returns']);
        }
      },
      error: err => {
        this.submitting = false;
        Swal.fire('Error', err.error?.message || 'Save failed', 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/purchase-returns']);
  }

  formatCurrency(value: any): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
