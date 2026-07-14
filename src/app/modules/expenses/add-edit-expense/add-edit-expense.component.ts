import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/services/expense.service';
import { ExpenseCategoryService } from 'src/app/services/expense-category.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { Expense } from 'src/app/models/expense.model';
import { ExpenseCategory } from 'src/app/models/expense-category.model';
import { ExpenseItem } from 'src/app/models/expense-item.model';
import { ExpenseAttachment } from 'src/app/models/expense-attachment.model';
import { environment } from 'src/environments/environment';
import Swal from 'src/app/services/sweet-alert.helper';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-edit-expense',
  templateUrl: './add-edit-expense.component.html',
  styleUrls: ['./add-edit-expense.component.css']
})
export class AddEditExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  isEdit = false;
  expenseId: number | null = null;
  loading = false;
  categories: ExpenseCategory[] = [];
  vendors: any[] = [];
  paymentMethods = ['CASH', 'BANK', 'MOBILE_BANKING', 'CHEQUE'];
  statuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];

  apiUrl = environment.apiUrl;

  // Attachment handling
  selectedFiles: File[] = [];
  attachments: ExpenseAttachment[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private expenseService: ExpenseService,
    private categoryService: ExpenseCategoryService,
    private supplierService: SupplierService
  ) {
    this.expenseForm = this.fb.group({
      expenseNo: ['', Validators.required],
      expenseDate: [new Date().toISOString().split('T')[0], Validators.required],
      vendorId: [null],
      paymentMethod: ['CASH', Validators.required],
      paymentStatus: ['UNPAID'],
      referenceNo: [''],
      notes: [''],
      status: ['DRAFT', Validators.required],
      discountAmount: [0, [Validators.min(0)]],      // for manual discount on entire expense
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadVendors();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.expenseId = +id;
      this.loadExpense();
    } else {
      this.addItem(); // start with one blank item
    }
  }

  get itemsArray(): FormArray {
    return this.expenseForm.get('items') as FormArray;
  }

  loadCategories(): void {
    this.categoryService.getActive().subscribe(data => this.categories = data);
  }

  loadVendors(): void {
    this.supplierService.getSuppliers().subscribe(data => this.vendors = data);
  }

  loadExpense(): void {
    this.loading = true;
    this.expenseService.getById(this.expenseId!).subscribe({
      next: (data) => {
        this.expenseForm.patchValue({
          expenseNo: data.expenseNo,
          expenseDate: data.expenseDate,
          vendorId: data.vendorId,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'UNPAID',
          referenceNo: data.referenceNo,
          notes: data.notes,
          status: data.status,
          discountAmount: data.discountAmount || 0
        });
        // Populate items
        if (data.items && data.items.length) {
          data.items.forEach(item => this.addItem(item));
        } else {
          this.addItem();
        }
        // Load existing attachments
        if (data.attachments) {
          this.attachments = data.attachments;
        }
        this.calculateTotals();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load expense', 'error');
        this.router.navigate(['/expenses']);
      }
    });
  }

  addItem(itemData?: ExpenseItem): void {
    const itemForm = this.fb.group({
      expenseItemId: [itemData?.expenseItemId || null],
      expCategoryId: [itemData?.expCategoryId || null, Validators.required],
      itemName: [itemData?.itemName || '', Validators.required],
      description: [itemData?.description || ''],
      quantity: [itemData?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [itemData?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      discountPercent: [itemData?.discountPercent || 0, [Validators.min(0), Validators.max(100)]],
      taxRate: [itemData?.taxRate || 0, [Validators.min(0)]],
      notes: [itemData?.notes || '']
    });
    this.itemsArray.push(itemForm);
    itemForm.valueChanges.subscribe(() => this.calculateTotals());
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
    this.calculateTotals();
  }

  calculateTotals(): void {
    let subtotal = 0;
    let totalTax = 0;
    for (const item of this.itemsArray.controls) {
      const qty = item.get('quantity')?.value || 0;
      const price = item.get('unitPrice')?.value || 0;
      const lineTotal = qty * price;
      const discount = lineTotal * (item.get('discountPercent')?.value || 0) / 100;
      const afterDiscount = lineTotal - discount;
      const tax = afterDiscount * (item.get('taxRate')?.value || 0) / 100;
      subtotal += lineTotal;
      totalTax += tax;
    }
    const discountAmount = this.expenseForm.get('discountAmount')?.value || 0;
    const grandTotal = subtotal - discountAmount + totalTax;
    this.expenseForm.patchValue({
      totalAmount: subtotal,
      taxAmount: totalTax,
      grandTotal: grandTotal
    }, { emitEvent: false });
  }

  save(): void {
    if (this.expenseForm.invalid) {
      Swal.fire('Validation', 'Please fill all required fields', 'warning');
      return;
    }
    this.loading = true;
    const formData = this.expenseForm.value;
    const expense: Expense = {
      ...formData
    };

    const wasEdit = this.isEdit;
    const request = this.isEdit && this.expenseId
      ? this.expenseService.update(this.expenseId, expense)
      : this.expenseService.create(expense);

    request.subscribe({
      next: (savedExpense) => {
        if (!this.isEdit) {
          this.expenseId = savedExpense.expenseId!;
          this.isEdit = true;
        }
        if (this.selectedFiles.length > 0) {
          this.uploadSelectedAttachmentsAfterSave(wasEdit ? 'updated' : 'created');
        } else {
          Swal.fire('Success', `Expense ${wasEdit ? 'updated' : 'created'}`, 'success');
          this.loading = false;
        }
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Operation failed', 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/expenses']);
  }

  // ==================== Attachment Methods ====================
  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  uploadAllAttachments(): void {
    if (!this.expenseId) {
      Swal.fire('Error', 'Please save the expense first', 'warning');
      return;
    }
    if (this.selectedFiles.length === 0) return;

    this.loading = true;
    this.uploadSelectedAttachmentsAfterSave('saved');
  }

  uploadSelectedAttachmentsAfterSave(actionLabel: string): void {
    const files = [...this.selectedFiles];
    const uploads = files.map(file =>
      this.expenseService.addAttachment(this.expenseId!, file).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(uploads).subscribe({
      next: (uploaded) => {
        const successful = uploaded.filter((att): att is ExpenseAttachment => !!att);
        this.attachments = [...this.attachments, ...successful];
        this.selectedFiles = [];
        this.loading = false;
        if (successful.length === files.length) {
          Swal.fire('Success', `Expense ${actionLabel} and ${successful.length} file(s) uploaded`, 'success');
        } else {
          Swal.fire('Warning', `Expense ${actionLabel}, but some files failed to upload`, 'warning');
        }
      },
      error: () => {
        this.loading = false;
        Swal.fire('Warning', `Expense ${actionLabel}, but files failed to upload`, 'warning');
      }
    });
  }

  getAttachmentUrl(fileName: string): string {
    return this.expenseService.getAttachmentUrl(fileName);
  }

  downloadAttachment(attachment: ExpenseAttachment): void {
    this.expenseService.downloadAttachment(attachment.fileName).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.originalName || attachment.fileName;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: error => Swal.fire('Error', error?.error?.message || 'Could not download receipt', 'error')
    });
  }

  deleteAttachment(id: number): void {
    this.expenseService.deleteAttachment(id).subscribe({
      next: () => {
        this.attachments = this.attachments.filter(a => a.attachmentId !== id);
        Swal.fire('Deleted', 'Attachment removed', 'success');
      },
      error: () => Swal.fire('Error', 'Could not delete', 'error')
    });
  }
}
