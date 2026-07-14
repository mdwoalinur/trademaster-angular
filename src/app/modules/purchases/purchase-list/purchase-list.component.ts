import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { SupplierService } from '../../../services/supplier.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { Purchase } from '../../../models/purchase.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.css']
})
export class PurchaseListComponent implements OnInit {
  purchases: Purchase[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  searchKeyword = '';
  selectedStatus = '';
  suppliers: any[] = [];
  warehouses: any[] = [];
  Math = Math;

  // Invoice Modal
  showPurchaseInvoice = false;
  selectedPurchase: any = null;

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private warehouseService: WarehouseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadWarehouses();
    this.loadPurchases();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => this.suppliers = data,
      error: () => console.error('Failed to load suppliers')
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: () => console.error('Failed to load warehouses')
    });
  }

  loadPurchases(): void {
    this.loading = true;
    this.purchaseService.getPurchases(this.currentPage - 1, this.pageSize, this.selectedStatus, this.searchKeyword)
      .subscribe({
        next: (res) => {
          this.purchases = res.content;
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to load purchases:', err);
          Swal.fire('Error', 'Failed to load purchases', 'error');
        }
      });
  }

  getSupplierName(supplierId: number): string {
    if (!supplierId) return 'Unknown';
    const supplier = this.suppliers.find(s => s.supplierId === supplierId);
    return supplier ? supplier.supplierName : 'Unknown';
  }

  getSupplier(supplierId: number): any {
    return this.suppliers.find(s => s.supplierId === supplierId);
  }

  getWarehouseName(warehouseId: number): string {
    if (!warehouseId) return 'Unknown';
    const warehouse = this.warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  }

  //  View purchase invoice (print)
  viewPurchaseInvoice(purchase: Purchase): void {
    this.selectedPurchase = purchase;
    this.showPurchaseInvoice = true;
  }

  // Close invoice modal
  closePurchaseInvoice(): void {
    this.showPurchaseInvoice = false;
    this.selectedPurchase = null;
  }

  onSearch(): void { 
    this.currentPage = 1; 
    this.loadPurchases(); 
  }
  
  onStatusChange(): void { 
    this.currentPage = 1; 
    this.loadPurchases(); 
  }
  
  resetFilters(): void { 
    this.searchKeyword = ''; 
    this.selectedStatus = ''; 
    this.currentPage = 1; 
    this.loadPurchases(); 
  }

  firstPage(): void { 
    if (this.currentPage !== 1) { 
      this.currentPage = 1; 
      this.loadPurchases(); 
    } 
  }
  
  previousPage(): void { 
    if (this.currentPage > 1) { 
      this.currentPage--; 
      this.loadPurchases(); 
    } 
  }
  
  nextPage(): void { 
    if (this.currentPage < this.totalPages) { 
      this.currentPage++; 
      this.loadPurchases(); 
    } 
  }
  
  lastPage(): void { 
    if (this.currentPage !== this.totalPages) { 
      this.currentPage = this.totalPages; 
      this.loadPurchases(); 
    } 
  }

  addPurchase(): void { 
    this.router.navigate(['/purchases/add']); 
  }
  
  editPurchase(purchaseId: number): void { 
    this.router.navigate(['/purchases/edit', purchaseId]); 
  }
  
  viewPurchase(purchaseId: number): void { 
    this.router.navigate(['/purchases/view', purchaseId]); 
  }

  markAsReceived(purchase: Purchase): void {
    Swal.fire({
      title: 'Mark as Received?',
      text: `Enter delivery date for PO: ${purchase.purchaseOrderNo}`,
      input: 'date',
      inputValue: new Date().toISOString().split('T')[0],
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      confirmButtonColor: '#28a745',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a delivery date';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const deliveryDate = result.value;
        const notes = `Received on ${deliveryDate}`;
        
        this.purchaseService.markAsReceived(purchase.purchaseId!, deliveryDate, notes).subscribe({
          next: () => {
            Swal.fire('Success', 'Purchase marked as received. Stock updated!', 'success');
            this.loadPurchases();
          },
          error: (err) => {
            console.error('Error marking as received:', err);
            Swal.fire('Error', err.error?.message || 'Failed to mark as received', 'error');
          }
        });
      }
    });
  }

  cancelPurchase(purchase: Purchase): void {
    Swal.fire({
      title: 'Cancel Purchase?',
      text: `Are you sure you want to cancel PO: ${purchase.purchaseOrderNo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.purchaseService.cancelPurchase(purchase.purchaseId!).subscribe({
          next: () => {
            Swal.fire('Cancelled', 'Purchase has been cancelled', 'success');
            this.loadPurchases();
          },
          error: (err) => {
            console.error('Error cancelling purchase:', err);
            Swal.fire('Error', err.error?.message || 'Failed to cancel purchase', 'error');
          }
        });
      }
    });
  }

  async deletePurchase(purchaseId: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Purchase?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it'
    });
    if (result.isConfirmed) {
      this.purchaseService.deletePurchase(purchaseId).subscribe({
        next: () => {
          Swal.fire('Deleted', 'Purchase deleted successfully', 'success');
          this.loadPurchases();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          Swal.fire('Error', err.error?.message || 'Delete failed', 'error');
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(amount);
  }

  formatDate(date: Date | string): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }

  getStatusBadge(status: string): string {
    switch(status) {
      case 'RECEIVED': return 'bg-success';
      case 'PENDING': return 'bg-warning';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  canReceive(purchase: Purchase): boolean {
    return purchase.status === 'PENDING';
  }

  canCancel(purchase: Purchase): boolean {
    return purchase.status === 'PENDING';
  }

  canEdit(purchase: Purchase): boolean {
    return purchase.status === 'PENDING';
  }

  canDelete(purchase: Purchase): boolean {
    return purchase.status !== 'RECEIVED';
  }

  sendOrderEmail(purchase: Purchase): void {
    if (!purchase.purchaseId) return;
    this.purchaseService.sendOrderEmail(purchase.purchaseId).subscribe({
      next: () => Swal.fire('Sent', 'Purchase order email sent successfully.', 'success'),
      error: (err) => {
        console.error('Failed to queue purchase order email:', err);
        Swal.fire('Error', err.error?.message || 'Failed to queue order email', 'error');
      }
    });
  }
}
