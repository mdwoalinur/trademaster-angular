import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';
import { ExpenseCategoryService } from 'src/app/services/expense-category.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { Expense } from 'src/app/models/expense.model';
import { ExpenseItem } from 'src/app/models/expense-item.model';
import { ExpenseAttachment } from 'src/app/models/expense-attachment.model';
import { environment } from 'src/environments/environment';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-expense-details',
  templateUrl: './expense-details.component.html',
  styleUrls: ['./expense-details.component.css']
})
export class ExpenseDetailsComponent implements OnInit {
  expense: Expense | null = null;
  items: ExpenseItem[] = [];
  attachments: ExpenseAttachment[] = [];             
  loading = false;
  actionLoading = false;
  expenseId: number = 0;

  
  categoryMap: Map<number, string> = new Map();
  vendorMap: Map<number, string> = new Map();

  showInvoice = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
    private categoryService: ExpenseCategoryService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadVendors();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.expenseId = +idParam;
      this.loadExpense();
    } else {
      this.router.navigate(['/expenses']);
    }
  }
  apiUrl = environment.apiUrl;

  getAttachmentUrl(fileName: string): string {
    return this.expenseService.getAttachmentUrl(fileName);
  }

  downloadAttachment(attachment: ExpenseAttachment): void {
    this.expenseService.downloadAttachment(attachment.fileName).subscribe({
      next: blob => this.saveBlob(blob, attachment.originalName || attachment.fileName),
      error: error => Swal.fire('Error', error?.error?.message || 'Could not download receipt', 'error')
    });
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        data.forEach(cat => {
          if (cat.expCategoryId) {
            this.categoryMap.set(cat.expCategoryId, cat.categoryName);
          }
        });
      },
      error: (err) => console.error('Failed to load categories', err)
    });
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
      error: (err) => console.error('Failed to load vendors', err)
    });
  }

  loadExpense(): void {
    this.loading = true;
    this.expenseService.getById(this.expenseId).subscribe({
      next: (data) => {
        this.expense = data;
        this.items = data.items || [];
        
        if (data.attachments) {
          this.attachments = data.attachments;
        } else {
          this.loadAttachments(); 
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load expense:', err);
        Swal.fire('Error', 'Failed to load expense details', 'error');
        this.router.navigate(['/expenses']);
      }
    });
  }

  
  loadAttachments(): void {
    this.expenseService.getAttachments(this.expenseId).subscribe({
      next: (data) => this.attachments = data,
      error: (err) => console.error('Failed to load attachments', err)
    });
  }

  getCategoryName(categoryId: number | null | undefined): string {
    if (!categoryId) return '—';
    return this.categoryMap.get(categoryId) || 'Unknown';
  }

  getVendorName(vendorId: number | null | undefined): string {
    if (!vendorId) return '—';
    return this.vendorMap.get(vendorId) || 'Unknown';
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'APPROVED': return 'badge bg-success';
      case 'SUBMITTED': return 'badge bg-info';
      case 'DRAFT': return 'badge bg-warning';
      case 'REJECTED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getPaymentStatusBadgeClass(payment: string): string {
    switch(payment) {
      case 'PAID': return 'badge bg-success';
      case 'PARTIAL': return 'badge bg-warning';
      case 'UNPAID': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  goBack(): void {
    this.router.navigate(['/expenses']);
  }

  editExpense(): void {
    if (this.expense?.expenseId) {
      if (!this.canEdit()) {
        Swal.fire('Not allowed', 'Approved or rejected expenses cannot be edited.', 'info');
        return;
      }
      this.router.navigate(['/expenses/edit', this.expense.expenseId]);
    }
  }

  // ==================== Approve / Reject ====================
  approveExpense(): void {
    if (!this.expense?.expenseId) return;
    if (!this.canApproveOrReject()) {
      Swal.fire('Not allowed', 'Only submitted expenses can be approved.', 'info');
      return;
    }
    Swal.fire({
      title: 'Approve Expense?',
      text: `Are you sure you want to approve "${this.expense.expenseNo}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve'
    }).then(result => {
      if (result.isConfirmed) {
        this.actionLoading = true;
        this.expenseService.approve(this.expense!.expenseId!).subscribe({
          next: (updated) => {
            this.expense = updated;
            this.items = updated.items || this.items;
            this.attachments = updated.attachments || this.attachments;
            this.actionLoading = false;
            Swal.fire('Approved', 'Expense approved successfully', 'success').then(() => this.loadExpense());
          },
          error: (err) => {
            this.actionLoading = false;
            Swal.fire('Error', err.error?.message || 'Approval failed', 'error');
          }
        });
      }
    });
  }

  rejectExpense(): void {
    if (!this.expense?.expenseId) return;
    if (!this.canApproveOrReject()) {
      Swal.fire('Not allowed', 'Only submitted expenses can be rejected.', 'info');
      return;
    }
    Swal.fire({
      title: 'Reject Expense?',
      input: 'text',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonText: 'Reject'
    }).then(result => {
      if (result.isConfirmed && result.value) {
        this.actionLoading = true;
        this.expenseService.reject(this.expense!.expenseId!, result.value).subscribe({
          next: (updated) => {
            this.expense = updated;
            this.items = updated.items || this.items;
            this.attachments = updated.attachments || this.attachments;
            this.actionLoading = false;
            Swal.fire('Rejected', 'Expense rejected', 'success').then(() => this.loadExpense());
          },
          error: (err) => {
            this.actionLoading = false;
            Swal.fire('Error', err.error?.message || 'Rejection failed', 'error');
          }
        });
      }
    });
  }

  canEdit(): boolean {
    return this.expense?.status === 'DRAFT' || this.expense?.status === 'SUBMITTED';
  }

  canApproveOrReject(): boolean {
    return this.expense?.status === 'SUBMITTED';
  }

  // ==================== Invoice ====================
  printExpense(): void {
    this.showInvoice = true;
  }

  closeInvoice(): void {
    this.showInvoice = false;
  }
}
