import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'src/app/services/sweet-alert.helper';
import { PurchaseReturn } from 'src/app/models/purchase-return.model';
import { PurchaseReturnService } from 'src/app/services/purchase-return.service';

@Component({
  selector: 'app-purchase-return-details',
  templateUrl: './purchase-return-details.component.html',
  styleUrls: ['./purchase-return-details.component.css']
})
export class PurchaseReturnDetailsComponent implements OnInit {
  returnId = 0;
  purchaseReturn?: PurchaseReturn;
  loading = false;
  confirming = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PurchaseReturnService
  ) {}

  ngOnInit(): void {
    this.returnId = Number(this.route.snapshot.paramMap.get('id') || 0);
    this.loadDetails();
  }

  loadDetails(): void {
    if (!this.returnId) return;
    this.loading = true;
    this.service.getById(this.returnId).subscribe({
      next: data => {
        this.purchaseReturn = data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load purchase return details', 'error');
      }
    });
  }

  back(): void {
    this.router.navigate(['/purchase-returns']);
  }

  edit(): void {
    if (this.purchaseReturn?.id) {
      this.router.navigate(['/purchase-returns/edit', this.purchaseReturn.id]);
    }
  }

  confirm(): void {
    if (!this.purchaseReturn?.id) return;
    Swal.fire({
      title: 'Confirm Purchase Return?',
      text: 'Stock will be decreased and this return will be locked.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm Return',
      confirmButtonColor: '#16a34a'
    }).then(result => {
      if (!result.isConfirmed || !this.purchaseReturn?.id) return;
      this.confirming = true;
      this.service.confirm(this.purchaseReturn.id).subscribe({
        next: () => {
          this.confirming = false;
          this.loadDetails();
          Swal.fire('Confirmed', 'Purchase return confirmed successfully.', 'success');
        },
        error: err => {
          this.confirming = false;
          Swal.fire('Error', err.error?.message || 'Confirm failed', 'error');
        }
      });
    });
  }

  canModify(): boolean {
    return this.purchaseReturn?.status === 'DRAFT';
  }

  badgeClass(status?: string): string {
    if (status === 'CONFIRMED') return 'bg-success';
    if (status === 'CANCELLED') return 'bg-danger';
    return 'bg-secondary';
  }

  formatCurrency(value: any): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(value: any): string {
    return value ? new Date(value).toLocaleDateString() : '-';
  }
}
