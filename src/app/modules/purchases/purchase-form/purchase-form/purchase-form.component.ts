import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from 'src/app/services/purchase.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { WarehouseService } from 'src/app/services/warehouse.service';
import { ProductService } from 'src/app/services/product.service';
import { BarcodeLookupService } from 'src/app/services/barcode-lookup.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css']
})
export class PurchaseFormComponent implements OnInit {
  purchaseForm!: FormGroup;
  isEdit = false;
  purchaseId: number | null = null;
  loading = false;
  submitting = false;
  suppliers: any[] = [];
  warehouses: any[] = [];
  products: any[] = [];
  subtotal = 0;
  totalTax = 0;
  totalDiscount = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private barcodeLookup: BarcodeLookupService,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSuppliers();
    this.loadWarehouses();
    this.loadProducts();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.purchaseId = +id;
      this.loadPurchase(this.purchaseId);
    } else {
      this.addItem();
    }
  }

  initForm(): void {
    this.purchaseForm = this.fb.group({
      supplierId: [null, Validators.required],
      warehouseId: [null],
      purchaseDate: [new Date().toISOString().split('T')[0], Validators.required],
      expectedDelivery: [''],
      paymentTerms: [''],
      notes: [''],
      items: this.fb.array([])
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) this.items.removeAt(index);
    else Swal.fire('Warning', 'At least one item is required', 'warning');
    this.calculateTotals();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        console.log('Suppliers loaded:', this.suppliers);
      },
      error: (err) => {
        console.error('Failed to load suppliers', err);
        Swal.fire('Error', 'Failed to load suppliers', 'error');
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: () => Swal.fire('Error', 'Failed to load warehouses', 'error')
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: () => Swal.fire('Error', 'Failed to load products', 'error')
    });
  }

  loadPurchase(id: number): void {
    this.loading = true;
    this.purchaseService.getPurchaseById(id).subscribe({
      next: (purchase) => {
        this.purchaseForm.patchValue({
          supplierId: purchase.supplierId,
          warehouseId: purchase.warehouseId,
          purchaseDate: new Date(purchase.purchaseDate).toISOString().split('T')[0],
          expectedDelivery: purchase.expectedDelivery ? new Date(purchase.expectedDelivery).toISOString().split('T')[0] : '',
          paymentTerms: purchase.paymentTerms,
          notes: purchase.notes
        });
        this.items.clear();
        if (purchase.items && purchase.items.length) {
          purchase.items.forEach(item => {
            const group = this.createItem();
            group.patchValue({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              tax: item.tax,
              discount: item.discount,
              notes: item.notes
            });
            this.items.push(group);
          });
        } else {
          this.addItem();
        }
        this.calculateTotals();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load purchase', 'error');
        this.router.navigate(['/purchases']);
      }
    });
  }

  onProductChange(index: number): void {
    const control = this.items.at(index);
    const productId = control.get('productId')?.value;
    const product = this.products.find(p => p.id === productId);
    if (product) {
      control.get('unitPrice')?.setValue(product.buyingPrice || 0);
      this.calculateTotals();
    }
  }

  // ==================== BARCODE SCANNER METHODS ====================

  openScannerForItem(): void {
    this.barcodeLookup.scanProduct().subscribe({
      next: result => this.addScannedProductToItems(result.product),
      error: error => this.alert.warning(
        this.barcodeLookup.isNotFound(error) ? 'BARCODE.PRODUCT_NOT_FOUND' : 'BARCODE.LOOKUP_FAILED'
      )
    });
  }

  addScannedProductToItems(product: any): void {
    const existingIndex = this.items.controls.findIndex(
      control => control.get('productId')?.value === product.id
    );
    if (existingIndex !== -1) {
      const currentQty = this.items.at(existingIndex).get('quantity')?.value || 0;
      this.items.at(existingIndex).get('quantity')?.setValue(currentQty + 1);
      Swal.fire('Added', `Increased quantity of "${product.productName}"`, 'success');
    } else {
      const newItem = this.createItem();
      newItem.patchValue({
        productId: product.id,
        quantity: 1,
        unitPrice: product.buyingPrice || 0,
        tax: 0,
        discount: 0,
        notes: ''
      });
      this.items.push(newItem);
      Swal.fire('Added', `"${product.productName}" added to purchase`, 'success');
    }
    this.calculateTotals();
  }

  // ==================== CALCULATIONS ====================

  calculateItemTotal(index: number): number {
    const control = this.items.at(index);
    const qty = control.get('quantity')?.value || 0;
    const price = control.get('unitPrice')?.value || 0;
    const tax = control.get('tax')?.value || 0;
    const disc = control.get('discount')?.value || 0;
    return (qty * price) + tax - disc;
  }

  calculateTotals(): void {
    let subtotal = 0, totalTax = 0, totalDisc = 0;
    for (let i = 0; i < this.items.length; i++) {
      const c = this.items.at(i);
      const qty = c.get('quantity')?.value || 0;
      const price = c.get('unitPrice')?.value || 0;
      subtotal += qty * price;
      totalTax += c.get('tax')?.value || 0;
      totalDisc += c.get('discount')?.value || 0;
    }
    this.subtotal = subtotal;
    this.totalTax = totalTax;
    this.totalDiscount = totalDisc;
    this.grandTotal = subtotal + totalTax - totalDisc;
  }

  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
      return;
    }

    const invalidItem = this.items.controls.find(
      (item: any) => !item.value.productId
    );
    if (invalidItem) {
      Swal.fire('Validation Error', 'All items must have a product selected', 'warning');
      return;
    }

    this.submitting = true;

    const formValue = this.purchaseForm.value;

    const purchaseData: any = {
      supplierId: Number(formValue.supplierId),
      warehouseId: formValue.warehouseId ? Number(formValue.warehouseId) : null,
      userId: 1,
      purchaseDate: formValue.purchaseDate || null,
      expectedDelivery: formValue.expectedDelivery || null,
      paymentTerms: formValue.paymentTerms || null,
      notes: formValue.notes || null,
      items: formValue.items.map((item: any) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        tax: Number(item.tax) || 0,
        discount: Number(item.discount) || 0,
        notes: item.notes || null
      }))
    };

    console.log('Sending payload:', purchaseData);

    const request = this.isEdit
      ? this.purchaseService.updatePurchase(this.purchaseId!, purchaseData)
      : this.purchaseService.createPurchase(purchaseData);

    request.subscribe({
      next: () => {
        Swal.fire('Success', `Purchase ${this.isEdit ? 'updated' : 'created'} successfully`, 'success');
        this.router.navigate(['/purchases']);
      },
      error: (err) => {
        console.error('Error response:', err);
        this.submitting = false;
        Swal.fire('Error', err.error?.message || 'Operation failed', 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/purchases']);
  }
}
