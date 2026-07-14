import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import { SweetAlertService } from '../../services/sweet-alert.service';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  constructor(
    private supplierService: SupplierService,
    private router: Router,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading suppliers:', err);
        this.loading = false;
      }
    });
  }

  get filteredSuppliers(): Supplier[] {
    let filtered = this.suppliers;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.supplierName.toLowerCase().includes(term) ||
        s.supplierCode.toLowerCase().includes(term) ||
        s.contactPerson?.toLowerCase().includes(term) ||
        s.city?.toLowerCase().includes(term)
      );
    }
    if (this.filterStatus !== 'ALL') {
      const active = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(s => s.status === active);
    }
    return filtered;
  }

  addSupplier(): void {
    this.router.navigate(['/suppliers/add']);
  }

  editSupplier(supplier: Supplier): void {
    this.router.navigate(['/suppliers/edit', supplier.supplierId]);
  }

  deleteSupplier(supplier: Supplier): void {
    if (!supplier.supplierId) return;
    const supplierId = supplier.supplierId;
    this.alert.delete('ALERT.ENTITY.SUPPLIER', supplier.supplierName).then(result => {
      if (!result.isConfirmed) return;
      this.supplierService.deleteSupplier(supplierId).subscribe({
        next: () => {
          this.loadSuppliers();
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

  getSupplierPhotoUrl(photoUrl?: string | null): string {
    return this.supplierService.getSupplierPhotoUrl(photoUrl);
  }

  onSupplierImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    img.parentElement?.classList.add('logo-fallback-visible');
  }

  getSupplierInitials(supplier: Supplier): string {
    const parts = (supplier.supplierName || 'Supplier').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'S';
  }
}
