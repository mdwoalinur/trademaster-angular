import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'src/app/services/sweet-alert.helper';
import { PurchaseReturn } from 'src/app/models/purchase-return.model';
import { PurchaseReturnService } from 'src/app/services/purchase-return.service';

@Component({
  selector: 'app-purchase-return-list',
  templateUrl: './purchase-return-list.component.html',
  styleUrls: ['./purchase-return-list.component.css']
})
export class PurchaseReturnListComponent implements OnInit {
  returns: PurchaseReturn[] = [];
  loading = false;
  search = '';
  status = '';
  startDate = '';
  endDate = '';

  constructor(private service: PurchaseReturnService, private router: Router) {}

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.loading = true;
    this.service.getAll({ search: this.search, status: this.status, startDate: this.startDate, endDate: this.endDate }).subscribe({
      next: data => {
        this.returns = data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load purchase returns', 'error');
      }
    });
  }

  resetFilters(): void {
    this.search = '';
    this.status = '';
    this.startDate = '';
    this.endDate = '';
    this.loadReturns();
  }

  addReturn(): void {
    this.router.navigate(['/purchase-returns/add']);
  }

  viewReturn(id: number | undefined): void {
    if (id) this.router.navigate(['/purchase-returns/view', id]);
  }

  editReturn(id: number | undefined): void {
    if (id) this.router.navigate(['/purchase-returns/edit', id]);
  }

  confirmReturn(row: PurchaseReturn): void {
    if (!row.id) return;
    Swal.fire({
      title: 'Confirm Purchase Return?',
      text: 'Stock will be decreased and stock movement will be recorded.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm Return',
      confirmButtonColor: '#16a34a'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.confirm(row.id!).subscribe({
          next: () => {
            Swal.fire('Confirmed', 'Purchase return confirmed successfully.', 'success');
            this.loadReturns();
          },
          error: err => Swal.fire('Error', err.error?.message || 'Confirm failed', 'error')
        });
      }
    });
  }

  deleteReturn(row: PurchaseReturn): void {
    if (!row.id) return;
    Swal.fire({
      title: 'Delete Draft Return?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.delete(row.id!).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Purchase return deleted.', 'success');
            this.loadReturns();
          },
          error: err => Swal.fire('Error', err.error?.message || 'Delete failed', 'error')
        });
      }
    });
  }

  canModify(row: PurchaseReturn): boolean {
    return row.status === 'DRAFT';
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
