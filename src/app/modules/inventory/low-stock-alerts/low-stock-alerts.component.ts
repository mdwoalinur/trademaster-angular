import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { ProductService } from '../../../services/product.service';
import { WarehouseService } from '../../../services/warehouse.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-low-stock-alerts',
  templateUrl: './low-stock-alerts.component.html',
  styleUrls: ['./low-stock-alerts.component.css']
})
export class LowStockAlertsComponent implements OnInit {
  alerts: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  loading = false;

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
    this.loadAlerts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe(data => this.warehouses = data);
  }

  loadAlerts(): void {
    this.loading = true;
    this.inventoryService.getAlerts().subscribe({
      next: (data) => {
        this.alerts = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load alerts', 'error');
      }
    });
  }

  generateAlerts(): void {
    this.inventoryService.generateAlerts().subscribe({
      next: () => {
        Swal.fire('Success', 'Alerts generated', 'success');
        this.loadAlerts();
      },
      error: () => Swal.fire('Error', 'Failed to generate alerts', 'error')
    });
  }

  markAsSent(id: number): void {
    this.inventoryService.markAlertAsSent(id).subscribe({
      next: () => {
        Swal.fire('Marked', 'Alert marked as sent', 'success');
        this.loadAlerts();
      },
      error: () => Swal.fire('Error', 'Failed', 'error')
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

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : '-';
  }
}
