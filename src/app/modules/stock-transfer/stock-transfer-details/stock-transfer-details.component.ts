import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockTransferService } from 'src/app/services/stock-transfer.service';
import { ProductService } from 'src/app/services/product.service';
import { WarehouseService } from 'src/app/services/warehouse.service';
import { StockTransfer, StockTransferItem, TransferStatus } from 'src/app/models/stock-transfer.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-stock-transfer-details',
  templateUrl: './stock-transfer-details.component.html',
  styleUrls: ['./stock-transfer-details.component.css']
})
export class StockTransferDetailsComponent implements OnInit {
  transfer: StockTransfer | null = null;
  items: StockTransferItem[] = [];
  loading = false;
  transferId: number = 0;
  
  // For displaying names
  fromWarehouseName: string = '';
  toWarehouseName: string = '';
  products: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transferService: StockTransferService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      Swal.fire('Error', 'Invalid transfer ID', 'error');
      this.router.navigate(['/stock-transfers']);
      return;
    }
    this.transferId = +idParam;
    this.loadProductsAndWarehouses();
  }

  loadProductsAndWarehouses(): void {
    this.loading = true;
    // Load products for name mapping
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products = prods;
        this.loadWarehouses();
      },
      error: () => {
        Swal.fire('Error', 'Failed to load products', 'error');
        this.loading = false;
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (warehouses) => {
        // Load transfer details after having names ready
        this.loadTransferDetails();
      },
      error: () => {
        Swal.fire('Error', 'Failed to load warehouses', 'error');
        this.loading = false;
      }
    });
  }

  loadTransferDetails(): void {
    this.transferService.getById(this.transferId).subscribe({
      next: (data) => {
        this.transfer = data;
        this.items = data.items || [];
        // Get warehouse names using the already loaded warehouse list
        this.warehouseService.getWarehouses().subscribe({
          next: (wh) => {
            const fromWh = wh.find(w => w.id === this.transfer?.fromWarehouseId);
            const toWh = wh.find(w => w.id === this.transfer?.toWarehouseId);
            this.fromWarehouseName = fromWh ? fromWh.name : 'Unknown';
            this.toWarehouseName = toWh ? toWh.name : 'Unknown';
            this.loading = false;
          },
          error: () => {
            this.fromWarehouseName = 'Unknown';
            this.toWarehouseName = 'Unknown';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to load transfer details', 'error');
        this.router.navigate(['/stock-transfers']);
      }
    });
  }

  getProductName(productId: number): string {
    return this.getProduct(productId)?.productName || 'Unknown Product';
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

  canApprove(): boolean {
    return this.transfer?.status === 'PENDING';
  }

  approveTransfer(): void {
    Swal.fire({
      title: 'Approve Transfer?',
      text: 'Stock will be moved between warehouses.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve'
    }).then(result => {
      if (result.isConfirmed) {
        this.transferService.approve(this.transferId, 1).subscribe({
          next: () => {
            Swal.fire('Approved', 'Transfer approved and stock updated', 'success');
            this.loadTransferDetails(); // refresh
          },
          error: () => Swal.fire('Error', 'Approval failed', 'error')
        });
      }
    });
  }

  rejectTransfer(): void {
    Swal.fire({
      title: 'Reject Transfer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject'
    }).then(result => {
      if (result.isConfirmed) {
        this.transferService.reject(this.transferId).subscribe({
          next: () => {
            Swal.fire('Rejected', 'Transfer rejected', 'success');
            this.loadTransferDetails();
          },
          error: () => Swal.fire('Error', 'Rejection failed', 'error')
        });
      }
    });
  }

  cancelTransfer(): void {
    Swal.fire({
      title: 'Cancel Transfer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.transferService.cancel(this.transferId).subscribe({
          next: () => {
            Swal.fire('Cancelled', 'Transfer cancelled', 'success');
            this.loadTransferDetails();
          },
          error: () => Swal.fire('Error', 'Cancel failed', 'error')
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/stock-transfers']);
  }

  getStatusBadgeClass(status: TransferStatus): string {
    switch(status) {
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'CANCELLED': return 'bg-secondary';
      default: return 'bg-warning text-dark';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }
}
