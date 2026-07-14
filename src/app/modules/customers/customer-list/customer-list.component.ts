import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/models/customer.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  searchTerm = '';
  filterType = 'ALL';
  filterStatus = 'ALL';
  typeOptions = ['ALL', 'RETAIL', 'WHOLESALE', 'CORPORATE'];
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.loading = false;
      }
    });
  }

  get filteredCustomers(): Customer[] {
    let filtered = this.customers;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.customerName.toLowerCase().includes(term) ||
        c.customerCode.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.includes(term))
      );
    }
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(c => c.customerType === this.filterType);
    }
    if (this.filterStatus !== 'ALL') {
      const active = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(c => c.status === active);
    }
    return filtered;
  }

  addCustomer(): void {
    this.router.navigate(['/customers/add']);
  }

  editCustomer(customer: Customer): void {
    this.router.navigate(['/customers/edit', customer.customerId]);
  }

  deleteCustomer(customer: Customer): void {
    if (!customer.customerId) return;
    const customerId = customer.customerId;
    this.alert.delete('ALERT.ENTITY.CUSTOMER', customer.customerName).then(result => {
      if (!result.isConfirmed) return;
      this.customerService.deleteCustomer(customerId).subscribe({
        next: () => {
          this.loadCustomers();
          this.alert.success('ALERT.DELETED_SUCCESS');
        },
        error: (err) => this.alert.error(err, 'ALERT.DELETE_FAILED')
      });
    });
  }

  getStatusClass(status: boolean): string {
    return status ? 'badge bg-success' : 'badge bg-secondary';
  }

  getStatusText(status: boolean): string {
    return status ? 'ACTIVE' : 'INACTIVE';
  }

  getCustomerTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      RETAIL: 'Retail',
      WHOLESALE: 'Wholesale',
      CORPORATE: 'Corporate'
    };
    return labels[type] || type;
  }
}
