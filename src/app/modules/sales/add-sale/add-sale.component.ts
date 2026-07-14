import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from 'src/app/services/sale.service';
import { CustomerService } from 'src/app/services/customer.service';
import { WarehouseService } from 'src/app/services/warehouse.service';
import { SaleItemService } from 'src/app/services/sale-item.service';
import { ProductService } from 'src/app/services/product.service';
import { BarcodeLookupService } from 'src/app/services/barcode-lookup.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { Sale } from 'src/app/models/sale.model';
import { Customer } from 'src/app/models/customer.model';
import { Warehouse } from 'src/app/models/warehouse.model';
import { Product } from 'src/app/models/product.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-sale',
  templateUrl: './add-sale.component.html',
  styleUrls: ['./add-sale.component.css']
})
export class AddSaleComponent implements OnInit {
  saleForm!: FormGroup;
  isEdit = false;
  saleId: number | null = null;
  loading = false;
  customers: Customer[] = [];
  warehouses: Warehouse[] = [];
  products: Product[] = [];

  showPrintOptions = false;
  showInvoice = false;
  invoiceType: 'thermal' | 'a4' | 'none' = 'thermal';
  completedSale: Sale | null = null;
  invoiceItems: any[] = [];

  subtotal = 0;
  totalTax = 0;
  totalDiscount = 0;
  grandTotal = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private saleService: SaleService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private saleItemService: SaleItemService,
    private productService: ProductService,
    private barcodeLookup: BarcodeLookupService,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
    this.loadWarehouses();
    this.loadProducts();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.saleId = +idParam;
      this.loadSale();
    } else {
      this.addItem();
    }
  }

  initForm(): void {
    this.saleForm = this.fb.group({
      invoiceNo: ['', Validators.required],
      saleDate: [new Date().toISOString().slice(0, 16), Validators.required],
      customerId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      discountAmount: [0, [Validators.min(0)]],
      paidAmount: [0, [Validators.min(0)]],
      paymentStatus: ['UNPAID'],
      status: ['COMPLETED'],
      notes: [''],
      items: this.fb.array([])
    });
  }

  get itemsArray(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      productName: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      taxRate: [0, [Validators.min(0)]],
      totalPrice: [{ value: 0, disabled: true }]
    });
  }

  addItem(): void {
    this.itemsArray.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.calculateTotals();
    } else {
      Swal.fire('Warning', 'At least one item is required', 'warning');
    }
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe(data => this.customers = data);
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe(data => this.warehouses = data);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  loadSale(): void {
    this.loading = true;
    this.saleService.getSaleById(this.saleId!).subscribe({
      next: (sale: Sale) => {
        // ✅ Fix: convert Date to string safely
        let saleDateStr = '';
        if (sale.saleDate) {
          const d = new Date(sale.saleDate);
          if (!isNaN(d.getTime())) {
            saleDateStr = d.toISOString().slice(0, 16);
          }
        }
        this.saleForm.patchValue({
          invoiceNo: sale.invoiceNo,
          saleDate: saleDateStr,
          customerId: sale.customerId,
          warehouseId: sale.warehouseId,
          discountAmount: sale.discountAmount,
          paidAmount: sale.paidAmount,
          paymentStatus: sale.paymentStatus,
          status: sale.status,
          notes: sale.notes
        });
        this.saleItemService.getSaleItemsBySaleId(this.saleId!).subscribe({
          next: (items: any[]) => {
            this.itemsArray.clear();
            items.forEach(item => {
              const group = this.createItem();
              group.patchValue({
                productId: item.productId,
                productName: this.getProductName(item.productId),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPercent: item.discountPercent,
                taxRate: item.taxRate,
                totalPrice: item.totalPrice
              });
              this.itemsArray.push(group);
            });
            this.calculateTotals();
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            Swal.fire('Error', 'Failed to load sale items', 'error');
          }
        });
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load sale', 'error');
        this.router.navigate(['/sales']);
      }
    });
  }

  onProductChange(index: number): void {
    const group = this.itemsArray.at(index);
    const productId = group.get('productId')?.value;
    const product = this.products.find(p => p.id === productId);
    if (product) {
      group.get('productName')?.setValue(product.productName);
      group.get('unitPrice')?.setValue(product.sellingPrice);
      group.get('taxRate')?.setValue(product.taxRate || 0);
      this.updateItemTotal(index);
    }
  }

  updateItemTotal(index: number): void {
    const group = this.itemsArray.at(index);
    const qty = group.get('quantity')?.value || 0;
    const price = group.get('unitPrice')?.value || 0;
    const discPercent = group.get('discountPercent')?.value || 0;
    const taxRate = group.get('taxRate')?.value || 0;

    const lineTotal = qty * price;
    const discount = lineTotal * discPercent / 100;
    const afterDiscount = lineTotal - discount;
    const tax = afterDiscount * taxRate / 100;
    const total = afterDiscount + tax;

    group.get('totalPrice')?.setValue(total, { emitEvent: false });
    this.calculateTotals();
  }

  calculateTotals(): void {
    let subtotal = 0, totalTax = 0, totalDiscount = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      const g = this.itemsArray.at(i);
      const qty = g.get('quantity')?.value || 0;
      const price = g.get('unitPrice')?.value || 0;
      const lineTotal = qty * price;
      subtotal += lineTotal;

      const disc = lineTotal * (g.get('discountPercent')?.value || 0) / 100;
      totalDiscount += disc;

      const afterDisc = lineTotal - disc;
      const tax = afterDisc * (g.get('taxRate')?.value || 0) / 100;
      totalTax += tax;
    }
    this.subtotal = subtotal;
    this.totalTax = totalTax;
    this.totalDiscount = totalDiscount;
    this.grandTotal = subtotal - totalDiscount + totalTax;

    this.saleForm.get('discountAmount')?.setValue(totalDiscount, { emitEvent: false });
  }

  getTotalItems(): number {
    return this.itemsArray.controls.reduce((sum, g) => sum + (g.get('quantity')?.value || 0), 0);
  }

  openScanner(): void {
    this.barcodeLookup.scanProduct().subscribe({
      next: result => this.addScannedProductToItems(result.product),
      error: error => this.alert.warning(
        this.barcodeLookup.isNotFound(error) ? 'BARCODE.PRODUCT_NOT_FOUND' : 'BARCODE.LOOKUP_FAILED'
      )
    });
  }

 //  Corrected addScannedProductToItems method
addScannedProductToItems(product: Product): void {
    const existingIndex = this.itemsArray.controls.findIndex(
        g => g.get('productId')?.value === product.id
    );

    if (existingIndex !== -1) {
        // Product already in list → increase quantity
        const currentQty = this.itemsArray.at(existingIndex).get('quantity')?.value || 0;
        this.itemsArray.at(existingIndex).get('quantity')?.setValue(currentQty + 1);
        this.updateItemTotal(existingIndex);  // safe, exists
        Swal.fire('Added', `Increased quantity of "${product.productName}"`, 'success');
    } else {
        // Create new item row
        const newItem = this.createItem();
        newItem.patchValue({
            productId: product.id,
            productName: product.productName,
            quantity: 1,
            unitPrice: product.sellingPrice,
            taxRate: product.taxRate || 0,
            discountPercent: 0
        });
        //  PUSH FIRST, then update total using new index
        this.itemsArray.push(newItem);
        this.updateItemTotal(this.itemsArray.length - 1);
        Swal.fire('Added', `"${product.productName}" added to sale`, 'success');
    }
    this.calculateTotals();
}

  showPrintDialog(): void {
    if (this.saleForm.invalid) {
      Swal.fire('Warning', 'Please fill all required fields', 'warning');
      return;
    }
    if (this.itemsArray.length === 0) {
      Swal.fire('Warning', 'At least one item is required', 'warning');
      return;
    }
    this.showPrintOptions = true;
  }

  processCheckout(printType: 'thermal' | 'a4' | 'none'): void {
    this.showPrintOptions = false;
    this.invoiceType = printType;
    this.calculateTotals();

    const formValue = this.saleForm.value;
    const saleData: any = {
      invoiceNo: formValue.invoiceNo,
      customerId: formValue.customerId,
      warehouseId: formValue.warehouseId,
      saleDate: new Date(formValue.saleDate).toISOString(),
      subtotal: this.subtotal,
      discountAmount: formValue.discountAmount,
      taxAmount: this.totalTax,
      totalAmount: this.grandTotal,
      paidAmount: formValue.paidAmount,
      dueAmount: this.grandTotal - formValue.paidAmount,
      paymentStatus: formValue.paymentStatus,
      notes: formValue.notes,
      status: formValue.status
    };

    const items = this.itemsArray.value.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      taxRate: item.taxRate,
      totalPrice: item.totalPrice
    }));

    this.loading = true;

    const saveObservable = this.isEdit && this.saleId
      ? this.saleService.updateSale(this.saleId, saleData)
      : this.saleService.createSale(saleData);

    saveObservable.subscribe({
      next: (savedSale: Sale) => {
        const itemObservables = items.map((item: any) =>
          this.saleItemService.createSaleItem({ ...item, saleId: savedSale.saleId })
        );
        let completed = 0;
        itemObservables.forEach((obs: any) => obs.subscribe({
          next: () => {
            completed++;
            if (completed === items.length) {
              this.loading = false;
              this.completedSale = savedSale;
              this.invoiceItems = items.map((item: any) => ({
                ...item,
                productName: this.getProductName(item.productId)
              }));
              if (printType !== 'none') {
                this.showInvoice = true;
              } else {
                Swal.fire('Success', `Sale ${this.isEdit ? 'updated' : 'created'}`, 'success')
                  .then(() => this.router.navigate(['/sales']));
              }
            }
          },
          error: (err: any) => {
            console.error(err);
            this.loading = false;
            Swal.fire('Error', 'Failed to save sale items', 'error');
          }
        }));
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Operation failed', 'error');
      }
    });
  }

  closeInvoice(): void {
    this.showInvoice = false;
    this.completedSale = null;
    this.router.navigate(['/sales']);
  }

  cancelPrintOptions(): void {
    this.showPrintOptions = false;
  }

  cancel(): void {
    this.router.navigate(['/sales']);
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getProductName(productId: number): string {
    const p = this.products.find(p => p.id === productId);
    return p ? p.productName : 'Unknown';
  }

  getCustomerName(): string {
    const c = this.customers.find(c => c.customerId === this.saleForm.get('customerId')?.value);
    return c ? c.customerName : '';
  }
}
