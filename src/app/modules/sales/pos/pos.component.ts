import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CustomerService } from '../../../services/customer.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { SaleService } from '../../../services/sale.service';
import { InventoryService } from '../../../services/inventory.service';
import { Product } from '../../../models/product.model';
import { Customer } from '../../../models/customer.model';
import { Warehouse } from '../../../models/warehouse.model';
import Swal from 'src/app/services/sweet-alert.helper';
import { BarcodeLookupService } from 'src/app/services/barcode-lookup.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  pageSize = 10;

  cart: CartItem[] = [];

  customers: Customer[] = [];
  warehouses: Warehouse[] = [];
  selectedCustomerId: number | null = null;
  selectedWarehouseId: number | null = null;

  // productId_warehouseId -> available qty
  inventoryMap: Map<string, number> = new Map();

  // productId -> total available qty from all warehouses
  totalStockMap: Map<number, number> = new Map();

  subtotal = 0;
  discountPercent = 0;
  discountAmount = 0;
  taxRate = 5;
  taxAmount = 0;
  total = 0;
  paidAmount = 0;
  change = 0;
  paymentMethod = 'CASH';
  notes = '';

  loading = false;
  submitting = false;

  showPrintOptions = false;
  showInvoice = false;
  invoiceType: 'thermal' | 'a4' | 'none' = 'thermal';
  completedSale: any = null;

  constructor(
    private productService: ProductService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private saleService: SaleService,
    private inventoryService: InventoryService,
    private barcodeLookup: BarcodeLookupService,
    private alert: SweetAlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadWarehouses();
    this.loadProducts();
    this.loadInventory();
  }

  openScanner(): void {
    this.barcodeLookup.scanProduct().subscribe({
      next: result => this.addToCart(result.product),
      error: error => this.alert.warning(
        this.barcodeLookup.isNotFound(error) ? 'BARCODE.PRODUCT_NOT_FOUND' : 'BARCODE.LOOKUP_FAILED'
      )
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (data) => this.customers = data.filter(c => c.status),
      error: (err) => console.error('❌ Failed to load customers:', err)
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses = data.filter(w => w.status === 'ACTIVE'),
      error: (err) => console.error('❌ Failed to load warehouses:', err)
    });
  }

  loadProducts(): void {
    this.loading = true;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.filter(p => p.status === 'ACTIVE');
        this.applyProductFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load products:', err);
        this.loading = false;
      }
    });
  }

  loadInventory(): void {
    this.inventoryService.getInventory().subscribe({
      next: (data) => {
        this.inventoryMap.clear();
        this.totalStockMap.clear();

        data.forEach(inv => {
          const productId = Number(
            inv.productId ?? inv.product_id ?? inv.product?.id
          );

          const warehouseId = Number(
            inv.warehouseId ?? inv.warehouse_id ?? inv.warehouse?.id
          );

          const qty = Number(
            inv.availableQuantity ??
            inv.available_quantity ??
            inv.quantity ??
            0
          );

          if (!productId || !warehouseId) return;

          this.inventoryMap.set(`${productId}_${warehouseId}`, qty);

          const currentTotal = this.totalStockMap.get(productId) || 0;
          this.totalStockMap.set(productId, currentTotal + qty);
        });

        this.applyProductFilter();
      },
      error: (err) => console.error('❌ Failed to load inventory:', err)
    });
  }

  getStockQuantity(productId: number): number {
    if (this.selectedWarehouseId) {
      return this.inventoryMap.get(`${productId}_${this.selectedWarehouseId}`) || 0;
    }

    return this.totalStockMap.get(productId) || 0;
  }

  isLowStock(productId: number): boolean {
    const stock = this.getStockQuantity(productId);
    return stock > 0 && stock < 10;
  }

  onWarehouseChange(): void {
    this.cart = [];
    this.calculateTotals();
    this.applyProductFilter();
  }

  applyProductFilter(): void {
    let result = [...this.products];

    if (this.selectedCategory) {
      const categoryId = Number(this.selectedCategory);
      result = result.filter(product => Number(product.categoryId) === categoryId);
    }

    if (this.selectedWarehouseId) {
      result = result.filter(product => {
        if (!product.id) return false;
        return this.getStockQuantity(product.id) > 0;
      });
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(product =>
        product.productName.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.productCode?.toLowerCase().includes(term)
      );
    }

    this.filteredProducts = result;
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }

  getCustomerName(): string {
    if (!this.selectedCustomerId) return '';
    const customer = this.customers.find(c => c.customerId === this.selectedCustomerId);
    return customer ? customer.customerName : '';
  }

  searchProducts(): void {
    this.currentPage = 1;
    this.applyProductFilter();
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.applyProductFilter();
  }

  addToCart(product: Product): void {
    const productId = product.id;
    if (!productId) return;

    if (!this.selectedWarehouseId) {
      Swal.fire(
        'Warehouse Required',
        'Please select a warehouse before adding product',
        'warning'
      );
      return;
    }

    const availableStock = this.getStockQuantity(productId);
    const existingItem = this.cart.find(item => item.productId === productId);
    const currentCartQty = existingItem ? existingItem.quantity : 0;

    if (availableStock <= 0) {
      Swal.fire('Out of Stock', `${product.productName} is not available in this warehouse.`, 'warning');
      return;
    }

    if (currentCartQty + 1 > availableStock) {
      Swal.fire({
        title: 'Insufficient Stock',
        text: `Only ${availableStock} units available in selected warehouse.`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (existingItem) {
      existingItem.quantity++;
      this.recalculateCartItem(existingItem);
    } else {
      const newItem: CartItem = {
        productId,
        productName: product.productName,
        imageUrl: product.imageUrl || '',
        sku: product.sku || '',
        quantity: 1,
        unitPrice: product.sellingPrice,
        taxRate: product.taxRate || this.taxRate,
        discountAmount: 0,
        taxAmount: 0,
        total: product.sellingPrice
      };

      this.recalculateCartItem(newItem);
      this.cart.push(newItem);
    }

    this.calculateTotals();
  }

  updateCartItem(item: CartItem, newQty: number): void {
    if (newQty <= 0) {
      this.removeFromCart(item);
      return;
    }

    const availableStock = this.getStockQuantity(item.productId);

    if (newQty > availableStock) {
      Swal.fire({
        title: 'Insufficient Stock',
        text: `Only ${availableStock} units available in selected warehouse.`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    item.quantity = newQty;
    this.recalculateCartItem(item);
    this.calculateTotals();
  }

  recalculateCartItem(item: CartItem): void {
    const lineSubtotal = item.unitPrice * item.quantity;
    item.discountAmount = (lineSubtotal * this.discountPercent) / 100;

    const lineAfterDiscount = lineSubtotal - item.discountAmount;
    item.taxAmount = (lineAfterDiscount * (item.taxRate || this.taxRate)) / 100;

    item.total = lineAfterDiscount + item.taxAmount;
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(i => i !== item);
    this.calculateTotals();
  }

  clearCart(): void {
    if (this.cart.length === 0) return;

    Swal.fire({
      title: 'Clear Cart?',
      text: 'All items will be removed',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.cart = [];
        this.calculateTotals();
      }
    });
  }

  calculateTotals(): void {
    this.cart.forEach(item => this.recalculateCartItem(item));

    this.subtotal = this.cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    this.discountAmount = this.cart.reduce(
      (sum, item) => sum + (item.discountAmount || 0),
      0
    );

    this.taxAmount = this.cart.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0
    );

    this.total = this.subtotal - this.discountAmount + this.taxAmount;
    this.calculateChange();
  }

  calculateChange(): void {
    this.change = this.paidAmount - this.total;
    if (this.change < 0) this.change = 0;
  }

  getTotalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get uniqueCategoryIds(): number[] {
    const ids = this.products
      .map(product => Number(product.categoryId))
      .filter(id => !!id);
    return Array.from(new Set(ids)).slice(0, 8);
  }

  get visibleProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  get paginationPages(): number[] {
    const total = this.totalPages;
    const pages: number[] = [];
    for (let page = 1; page <= total && page <= 5; page++) {
      pages.push(page);
    }
    return pages;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProducts.length);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  showPrintDialog(): void {
    if (this.cart.length === 0) {
      Swal.fire('Warning', 'Cart is empty', 'warning');
      return;
    }

    if (!this.selectedWarehouseId) {
      Swal.fire('Warning', 'Please select a warehouse', 'warning');
      return;
    }

    if (this.paidAmount < this.total) {
      const shortage = this.total - this.paidAmount;
      Swal.fire('Warning', `Insufficient payment. Need ${shortage.toFixed(2)} more.`, 'warning');
      return;
    }

    this.showPrintOptions = true;
  }

  processCheckout(printType: 'thermal' | 'a4' | 'none'): void {
    this.showPrintOptions = false;
    this.invoiceType = printType;

    if (this.cart.length === 0) {
      Swal.fire('Warning', 'Cart is empty', 'warning');
      return;
    }

    if (!this.selectedWarehouseId) {
      Swal.fire('Warning', 'Please select a warehouse', 'warning');
      return;
    }

    for (const item of this.cart) {
      const availableStock = this.getStockQuantity(item.productId);

      if (item.quantity > availableStock) {
        Swal.fire(
          'Stock Error',
          `${item.productName} has only ${availableStock} units available.`,
          'error'
        );
        return;
      }
    }

    this.submitting = true;

    const payload = {
      customerId: this.selectedCustomerId,
      warehouseId: this.selectedWarehouseId,
      userId: Number(localStorage.getItem('userId')) || 1,
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      taxAmount: this.taxAmount,
      totalAmount: this.total,
      paidAmount: this.paidAmount,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
      items: this.cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: this.discountPercent || 0,
        discountAmount: item.discountAmount || 0,
        taxRate: item.taxRate || this.taxRate || 0,
        totalPrice: item.total
      }))
    };

    this.saleService.posCheckout(payload).subscribe({
      next: (createdSale) => {
        this.submitting = false;
        this.completedSale = createdSale;

        this.loadInventory();
        this.loadProducts();

        if (printType !== 'none') {
          this.showInvoice = true;
        } else {
          Swal.fire(
            'Success',
            `Sale completed. Invoice: ${createdSale.invoiceNo}`,
            'success'
          ).then(() => {
            this.resetPos();
            this.router.navigate(['/sales']);
          });
        }
      },
      error: (err) => {
        this.submitting = false;
        Swal.fire(
          'Error',
          err.error?.message || 'Checkout failed',
          'error'
        );
      }
    });
  }

  closeInvoice(): void {
    this.showInvoice = false;
    this.completedSale = null;
    this.resetPos();
    this.router.navigate(['/sales']);
  }

  cancelPrintOptions(): void {
    this.showPrintOptions = false;
  }

  resetPos(): void {
    this.cart = [];
    this.searchTerm = '';
    this.selectedCustomerId = null;
    this.selectedWarehouseId = null;
    this.discountPercent = 0;
    this.taxRate = 5;
    this.paidAmount = 0;
    this.notes = '';
    this.subtotal = 0;
    this.discountAmount = 0;
    this.taxAmount = 0;
    this.total = 0;
    this.change = 0;
    this.submitting = false;
    this.loadProducts();
    this.loadInventory();
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getDueAmount(): number {
    return Math.max(this.total - this.paidAmount, 0);
  }

  getStockBadgeClass(productId: number): string {
    const stock = this.getStockQuantity(productId);
    if (stock <= 0) return 'out';
    if (stock < 10) return 'low';
    return 'in';
  }

  getCartItemImageUrl(item: CartItem): string {
    return this.productService.getProductImageUrl(item.imageUrl || '');
  }

  getProductImageUrl(product: Product): string {
    return this.productService.getProductImageUrl(product.imageUrl);
  }

  onProductImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.productService.getProductImageUrl('');
  }
}

interface CartItem {
  productId: number;
  productName: string;
  imageUrl?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount?: number;
  taxAmount?: number;
  total: number;
}
