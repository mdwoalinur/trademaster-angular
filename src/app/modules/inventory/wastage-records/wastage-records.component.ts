import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { ProductService } from 'src/app/services/product.service';
import { WarehouseService } from '../../../services/warehouse.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-wastage-records',
  templateUrl: './wastage-records.component.html',
  styleUrls: ['./wastage-records.component.css']
})
export class WastageRecordsComponent implements OnInit {
  records: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  loading = false;
  searchTerm = '';
  selectedWastageType = '';  //  Added for filtering
  selectedStatus = '';       //  Added for filtering
  wastageTypes = ['PRODUCTION', 'STORAGE', 'HANDLING', 'EXPIRED', 'DAMAGED', 'RETURN', 'OTHER'];
  statusOptions = ['PENDING', 'APPROVED', 'REJECTED'];

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
    this.loadRecords();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error('Failed to load products:', err)
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: (err) => console.error('Failed to load warehouses:', err)
    });
  }

  loadRecords(): void {
    this.loading = true;
    this.inventoryService.getWastageRecords().subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load records:', err);
        Swal.fire('Error', 'Failed to load wastage records', 'error');
      }
    });
  }

  // Added filtered getter
  get filteredRecords(): any[] {
    let filtered = this.records;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        this.getProductName(r.productId).toLowerCase().includes(term) ||
        r.batchNo?.toLowerCase().includes(term) ||
        r.reason?.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedWastageType) {
      filtered = filtered.filter(r => r.wastageType === this.selectedWastageType);
    }
    
    if (this.selectedStatus) {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }
    
    return filtered;
  }

  //  Added reset filters
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedWastageType = '';
    this.selectedStatus = '';
  }

  deleteRecord(id: number): void {
    Swal.fire({
      title: 'Delete Record?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.inventoryService.deleteWastageRecord(id).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Record deleted', 'success');
            this.loadRecords();
          },
          error: (err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  approveRecord(id: number): void {
    Swal.fire({
      title: 'Approve Record?',
      text: 'This will update stock quantity.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.inventoryService.approveWastageRecord(id, 1).subscribe({
          next: () => {
            Swal.fire('Approved', 'Wastage approved and stock updated', 'success');
            this.loadRecords();
          },
          error: (err) => {
            console.error('Approval failed:', err);
            Swal.fire('Error', err.error?.message || 'Approval failed', 'error');
          }
        });
      }
    });
  }

  getProductName(productId: number): string {
    if (!productId) return 'Unknown';
    const product = this.getProduct(productId);
    return product ? product.productName : 'Unknown';
  }

  getProduct(productId: number): any {
    return this.products.find(p => p.id === productId || p.productId === productId);
  }

  getProductSku(productId: number): string {
    const product = this.getProduct(productId);
    return product?.sku || product?.productCode || '';
  }

  getProductImageUrl(productId: number): string {
    return this.getProduct(productId)?.imageUrl || '';
  }

  getWarehouseName(warehouseId: number): string {
    if (!warehouseId) return 'Unknown';
    const warehouse = this.warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }

  getStatusBadge(status: string): string {
    switch(status) {
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-warning';
    }
  }

  getWastageTypeBadge(type: string): string {
    switch(type) {
      case 'EXPIRED': return 'bg-danger';
      case 'DAMAGED': return 'bg-warning';
      case 'PRODUCTION': return 'bg-info';
      case 'STORAGE': return 'bg-secondary';
      default: return 'bg-dark';
    }
  }
}
