import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { Expense } from 'src/app/models/expense.model';
import Swal from 'src/app/services/sweet-alert.helper';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  searchKeyword = '';
  selectedStatus = '';
  statusOptions = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];
  Math = Math;

  // Vendor map for display names
  vendorMap: Map<number, string> = new Map();

  constructor(
    private expenseService: ExpenseService,
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVendors();
    this.loadExpenses();
  }

  loadVendors(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        data.forEach(v => {
          if (v.supplierId) {
            this.vendorMap.set(v.supplierId, v.supplierName);
          }
        });
      },
      error: (err) => console.error('Failed to load vendors:', err)
    });
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getExpenses(this.currentPage - 1, this.pageSize, this.selectedStatus, this.searchKeyword)
      .subscribe({
        next: (res) => {
          this.expenses = res.content;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to load expenses', 'error');
        }
      });
  }

  getVendorName(vendorId: number | null | undefined): string {
    if (!vendorId) return '—';
    return this.vendorMap.get(vendorId) || 'Unknown';
  }

  onSearch(): void { this.currentPage = 1; this.loadExpenses(); }
  onStatusChange(): void { this.currentPage = 1; this.loadExpenses(); }
  resetFilters(): void { this.searchKeyword = ''; this.selectedStatus = ''; this.currentPage = 1; this.loadExpenses(); }

  firstPage(): void { if (this.currentPage !== 1) { this.currentPage = 1; this.loadExpenses(); } }
  previousPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadExpenses(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadExpenses(); } }
  lastPage(): void { if (this.currentPage !== this.totalPages) { this.currentPage = this.totalPages; this.loadExpenses(); } }

  addExpense(): void { this.router.navigate(['/expenses/add']); }
  editExpense(id: number): void { this.router.navigate(['/expenses/edit', id]); }
  viewExpense(id: number): void { this.router.navigate(['/expenses/view', id]); }

  viewAttachments(expense: Expense): void {
    if (!expense.expenseId) return;

    this.expenseService.getAttachments(expense.expenseId).subscribe({
      next: (attachments) => {
        if (!attachments.length) {
          Swal.fire('No files', 'No receipt files uploaded for this expense.', 'info');
          return;
        }

        forkJoin(attachments.map(att => this.expenseService.downloadAttachment(att.fileName).pipe(
          map(blob => ({ attachment: att, url: URL.createObjectURL(blob) }))
        ))).subscribe({
          next: files => {
            const links = files.map(({ attachment, url }) => {
              const name = this.escapeHtml(attachment.originalName || attachment.fileName);
              const size = attachment.fileSize ? `${Number(attachment.fileSize).toLocaleString()} bytes` : '';
              return `<a class="expense-file-link" href="${url}" download="${name}"><i class="bi bi-paperclip"></i><span>${name}</span><small>${size}</small></a>`;
            }).join('');
            Swal.fire({
              title: `Receipts - ${expense.expenseNo}`,
              html: `<div class="expense-file-list">${links}</div>`,
              width: 520,
              showConfirmButton: false,
              showCloseButton: true,
              didClose: () => files.forEach(file => URL.revokeObjectURL(file.url))
            });
          },
          error: () => Swal.fire('Error', 'Could not download receipt files', 'error')
        });
      },
      error: () => Swal.fire('Error', 'Could not load receipt files', 'error')
    });
  }

  // Quick Approve from list
  quickApprove(id: number): void {
    Swal.fire({
      title: 'Approve Expense?',
      text: 'Approve this expense?',
      icon: 'question',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.expenseService.approve(id).subscribe({
          next: () => {
            Swal.fire('Approved', 'Expense approved', 'success');
            this.loadExpenses();
          },
          error: (err) => Swal.fire('Error', err.error?.message || 'Failed', 'error')
        });
      }
    });
  }

  requestPayment(expense: Expense): void {
    if (!expense.expenseId) return;
    const total = Number(expense.grandTotal || 0);
    Swal.fire({
      title: 'Request Expense Payment?',
      input: 'number',
      inputLabel: 'Requested Amount',
      inputValue: total,
      inputAttributes: { min: '0.01', step: '0.01' },
      showCancelButton: true,
      confirmButtonText: 'Submit Request'
    }).then(result => {
      if (result.isConfirmed) {
        this.expenseService.requestPayment(expense.expenseId!, Number(result.value), expense.paymentMethod, 'Expense payment request').subscribe({
          next: () => Swal.fire('Submitted', 'Payment request submitted for admin approval', 'success'),
          error: (err) => Swal.fire('Error', err.error?.message || 'Payment request failed', 'error')
        });
      }
    });
  }

  deleteExpense(id: number): void {
    Swal.fire({
      title: 'Delete Expense?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.expenseService.delete(id).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Expense deleted', 'success');
            this.loadExpenses();
          },
          error: () => Swal.fire('Error', 'Delete failed', 'error')
        });
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(amount);
  }

  formatDate(date: Date | string): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char] || char));
  }

  getStatusBadge(status: string): string {
    switch(status) {
      case 'APPROVED': return 'bg-success';
      case 'SUBMITTED': return 'bg-info';
      case 'DRAFT': return 'bg-warning';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPaymentStatusBadge(payment: string): string {
    switch(payment) {
      case 'PAID': return 'bg-success';
      case 'PARTIAL': return 'bg-warning';
      case 'UNPAID': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
