import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { ProductService } from '../../../services/product.service';
import { WarehouseService } from '../../../services/warehouse.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-stock-overview',
  templateUrl: './stock-overview.component.html',
  styleUrls: ['./stock-overview.component.css']
})
export class StockOverviewComponent implements OnInit {
  stocks: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  loading = false;
  searchTerm = '';
  selectedWarehouse = '';

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
    this.loadStocks();
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

  loadStocks(): void {
    this.loading = true;
    this.inventoryService.getInventory().subscribe({
      next: (data) => {
        this.stocks = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load stock data', 'error');
      }
    });
  }

  getProduct(productId: number): any {
    return this.products.find(p => p.id === productId || p.productId === productId);
  }

  getProductName(productId: number): string {
    const product = this.getProduct(productId);
    return product ? product.productName : 'Unknown';
  }

  getProductSku(productId: number): string {
    const product = this.getProduct(productId);
    return product?.sku || product?.productCode || '';
  }

  getProductImageUrl(productId: number): string {
    return this.getProduct(productId)?.imageUrl || '';
  }

  getWarehouseName(warehouseId: number): string {
    const warehouse = this.warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  }

  get filteredStocks(): any[] {
    let filtered = this.stocks;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        this.getProductName(s.productId).toLowerCase().includes(term)
      );
    }
    if (this.selectedWarehouse) {
      filtered = filtered.filter(s => s.warehouseId === +this.selectedWarehouse);
    }
    return filtered;
  }

  isLowStock(quantity: number, productId: number): boolean {
    const product = this.getProduct(productId);
    return product && quantity <= (product.reorderLevel || 0);
  }
}
