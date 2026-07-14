import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SaleService } from 'src/app/services/sale.service';
import { CustomerService } from 'src/app/services/customer.service';
import { WarehouseService } from 'src/app/services/warehouse.service';
import { SaleItemService } from 'src/app/services/sale-item.service';  
import { Sale } from 'src/app/models/sale.model';
import { SaleItem } from 'src/app/models/sale-item.model';          
import { Customer } from 'src/app/models/customer.model';
import { Warehouse } from 'src/app/models/warehouse.model';
import Swal from 'src/app/services/sweet-alert.helper';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.css']
})
export class SaleListComponent implements OnInit {
  sales: Sale[] = [];
  customers: Customer[] = [];
  warehouses: Warehouse[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  filterPayment = 'ALL';
  statusOptions = ['ALL', 'COMPLETED', 'CANCELLED'];
  paymentOptions = ['ALL', 'PAID', 'UNPAID', 'PARTIAL'];

  // Invoice modal properties
  showSaleInvoice = false;
  selectedSale: Sale | null = null;
  selectedSaleItems: SaleItem[] = [];
  selectedCustomerName = '';
  selectedCustomerPhotoUrl = '';
  selectedCustomerEmail = '';
  selectedCustomerPhone = '';
  selectedWarehouseName = '';

  constructor(
    private saleService: SaleService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private saleItemService: SaleItemService,   
    private router: Router,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadWarehouses();
    this.loadSales();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (data) => this.customers = data,
      error: (err) => console.error(err)
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: (err) => console.error(err)
    });
  }

  loadSales(): void {
    this.loading = true;
    this.saleService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sales:', err);
        this.loading = false;
      }
    });
  }

  get filteredSales(): Sale[] {
    let filtered = this.sales;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        (s.invoiceNo || '').toLowerCase().includes(term) ||
        this.getCustomerName(s.customerId).toLowerCase().includes(term)
      );
    }
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(s => s.status === this.filterStatus);
    }
    if (this.filterPayment !== 'ALL') {
      filtered = filtered.filter(s => s.paymentStatus === this.filterPayment);
    }
    return filtered;
  }

  addSale(): void {
    this.router.navigate(['/sales/add']);
  }

  editSale(sale: Sale): void {
    this.router.navigate(['/sales/edit', sale.saleId]);
  }

  deleteSale(sale: Sale): void {
    if (!sale.saleId) return;
    const saleId = sale.saleId;
    this.alert.delete('ALERT.ENTITY.SALE', sale.invoiceNo).then(result => {
      if (!result.isConfirmed) return;
      this.saleService.deleteSale(saleId).subscribe({
        next: () => {
          this.loadSales();
          this.alert.success('ALERT.DELETED_SUCCESS');
        },
        error: (err) => this.alert.error(err, 'ALERT.DELETE_FAILED')
      });
    });
  }

  getCustomerName(customerId: number): string {
    const customer = this.getCustomer(customerId);
    return customer ? customer.customerName : 'Unknown';
  }

  getCustomer(customerId: number): Customer | undefined {
    return this.customers.find(c => c.customerId === customerId);
  }

  getWarehouseName(warehouseId: number): string {
    const warehouse = this.warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'COMPLETED': return 'sale-status-badge completed';
      case 'PENDING': return 'sale-status-badge pending';
      case 'CANCELLED': return 'sale-status-badge cancelled';
      default: return 'sale-status-badge neutral';
    }
  }

  getPaymentClass(payment: string): string {
    switch(payment) {
      case 'PAID': return 'payment-status-badge paid';
      case 'PARTIAL': return 'payment-status-badge partial';
      case 'UNPAID': return 'payment-status-badge unpaid';
      default: return 'payment-status-badge neutral';
    }
  }

  get totalSalesCount(): number {
    return this.filteredSales.length;
  }

  get completedSalesCount(): number {
    return this.filteredSales.filter(s => s.status === 'COMPLETED').length;
  }

  get totalRevenue(): number {
    return this.filteredSales.reduce((total, sale) => total + Number(sale.totalAmount || 0), 0);
  }

  get totalDue(): number {
    return this.filteredSales.reduce((total, sale) => total + Number(sale.dueAmount || 0), 0);
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

  formatTime(date: Date | string | null | undefined): string {
    return date ? new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
  }

  //  Invoice print method
  viewSaleInvoice(sale: Sale): void {
    this.selectedSale = sale;
    this.saleItemService.getSaleItemsBySaleId(sale.saleId!).subscribe({
      next: (items: SaleItem[]) => {
        this.selectedSaleItems = items;
      },
      error: (err) => console.error('Failed to load sale items:', err)
    });
    this.selectedCustomerName = this.getCustomerName(sale.customerId);
    const customer = this.getCustomer(sale.customerId);
    this.selectedCustomerPhotoUrl = customer?.photoUrl || '';
    this.selectedCustomerEmail = customer?.email || '';
    this.selectedCustomerPhone = customer?.mobile || customer?.phone || '';
    this.selectedWarehouseName = this.getWarehouseName(sale.warehouseId);
    this.showSaleInvoice = true;
  }

  closeSaleInvoice(): void {
    this.showSaleInvoice = false;
    this.selectedSale = null;
    this.selectedSaleItems = [];
    this.selectedCustomerPhotoUrl = '';
    this.selectedCustomerEmail = '';
    this.selectedCustomerPhone = '';
  }

  // Return Sale 
returnSale(saleId: number): void {
  this.router.navigate(['/sales-returns/add', saleId]);
}

sendInvoiceEmail(sale: Sale): void {
  if (!sale.saleId) return;
  this.saleService.sendInvoiceEmail(sale.saleId).subscribe({
    next: () => Swal.fire('Sent', 'Sales invoice email sent successfully.', 'success'),
    error: (err) => {
      console.error('Failed to queue sales invoice email:', err);
      Swal.fire('Error', err.error?.message || 'Failed to queue invoice email', 'error');
    }
  });
}
}
