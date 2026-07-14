import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { ProductService } from '../../../services/product.service';
import { WarehouseService } from '../../../services/warehouse.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-stock-movements',
  templateUrl: './stock-movements.component.html',
  styleUrls: ['./stock-movements.component.css']
})
export class StockMovementsComponent implements OnInit {
  movements: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  loading = false;
  searchTerm = '';
  selectedType = '';
  movementTypes = ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER'];

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
    this.loadMovements();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe(data => this.warehouses = data);
  }

  loadMovements(): void {
    this.loading = true;
    this.inventoryService.getMovements().subscribe({
      next: (data) => {
        this.movements = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load stock movements', 'error');
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

  get filteredMovements(): any[] {
    let filtered = this.movements;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        this.getProductName(m.productId).toLowerCase().includes(term) ||
        m.movementType.toLowerCase().includes(term) ||
        m.referenceNo?.toLowerCase().includes(term)
      );
    }
    if (this.selectedType) {
      filtered = filtered.filter(m => m.movementType === this.selectedType);
    }
    return filtered;
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : '-';
  }
}
