import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SaleItemService } from 'src/app/services/sale-item.service';
import { SaleService } from 'src/app/services/sale.service';
import { ProductService } from 'src/app/services/product.service';
import { SaleItem } from 'src/app/models/sale-item.model';
import { Sale } from 'src/app/models/sale.model';
import { Product } from 'src/app/models/product.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-sale-item-list',
  templateUrl: './sale-item-list.component.html',
  styleUrls: ['./sale-item-list.component.css']
})
export class SaleItemListComponent implements OnInit {
  saleItems: SaleItem[] = [];
  sales: Sale[] = [];
  products: Product[] = [];
  loading = false;
  searchTerm = '';
  filterInvoice = 'ALL';
  filterTaxRate = 'ALL';
  viewMode: 'table' | 'grid' = 'table';

  constructor(
    private saleItemService: SaleItemService,
    private saleService: SaleService,
    private productService: ProductService,
    private router: Router,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadProducts();
    this.loadSaleItems();
  }

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (data) => this.sales = data,
      error: (err) => console.error(err)
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }

  loadSaleItems(): void {
    this.loading = true;
    this.saleItemService.getSaleItems().subscribe({
      next: (data) => {
        this.saleItems = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  get filteredSaleItems(): SaleItem[] {
    let filtered = this.saleItems;
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(item =>
        this.getSaleInvoiceNo(item.saleId).toLowerCase().includes(term) ||
        this.getProductName(item.productId).toLowerCase().includes(term) ||
        this.getProductSku(item.productId).toLowerCase().includes(term)
      );
    }
    if (this.filterInvoice !== 'ALL') {
      filtered = filtered.filter(item => String(item.saleId) === this.filterInvoice);
    }
    if (this.filterTaxRate !== 'ALL') {
      filtered = filtered.filter(item => String(item.taxRate) === this.filterTaxRate);
    }
    return filtered;
  }

  get taxRateOptions(): number[] {
    return Array.from(new Set(this.saleItems.map(item => Number(item.taxRate || 0)))).sort((a, b) => a - b);
  }

  get totalSaleItems(): number {
    return this.filteredSaleItems.length;
  }

  get totalQuantity(): number {
    return this.filteredSaleItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }

  get totalValue(): number {
    return this.filteredSaleItems.reduce((total, item) => total + Number(item.totalPrice || 0), 0);
  }

  addSaleItem(): void {
    this.router.navigate(['/sales/items/add']);
  }

  editSaleItem(item: SaleItem): void {
    this.router.navigate(['/sales/items/edit', item.salesItemId]);
  }

  deleteSaleItem(item: SaleItem): void {
    if (!item.salesItemId) return;
    const saleItemId = item.salesItemId;
    this.alert.delete('ALERT.ENTITY.SALE_ITEM', this.getProductName(item.productId)).then(result => {
      if (!result.isConfirmed) return;
      this.saleItemService.deleteSaleItem(saleItemId).subscribe({
        next: () => {
          this.loadSaleItems();
          this.alert.success('ALERT.DELETED_SUCCESS');
        },
        error: (err) => this.alert.error(err, 'ALERT.DELETE_FAILED')
      });
    });
  }

  getSaleInvoiceNo(saleId: number): string {
    const sale = this.sales.find(s => s.saleId === saleId);
    return sale ? sale.invoiceNo : 'Unknown';
  }

  getProductName(productId: number): string {
    const product = this.getProduct(productId);
    return product ? product.productName : 'Unknown';
  }

  getProduct(productId: number): Product | undefined {
    return this.products.find(p => p.id === productId);
  }

  getProductSku(productId: number): string {
    const product = this.getProduct(productId);
    return product?.sku || product?.productCode || '';
  }

  getProductImageUrl(productId: number): string {
    return this.getProduct(productId)?.imageUrl || '';
  }

  getSale(saleId: number): Sale | undefined {
    return this.sales.find(s => s.saleId === saleId);
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(date: Date | string | null | undefined): string {
    return date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  }
}
