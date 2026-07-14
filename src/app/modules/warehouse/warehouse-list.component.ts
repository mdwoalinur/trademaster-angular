import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { SweetAlertService } from '../../services/sweet-alert.service';

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.css']
})
export class WarehouseListComponent implements OnInit {
  warehouses: Warehouse[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  constructor(
    private warehouseService: WarehouseService,
    private router: Router,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading = true;
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading warehouses:', err);
        this.loading = false;
      }
    });
  }

  get filteredWarehouses(): Warehouse[] {
    let filtered = this.warehouses;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(term) ||
        w.warehouseCode.toLowerCase().includes(term) ||
        (w.location && w.location.toLowerCase().includes(term)) ||
        (w.managerName && w.managerName.toLowerCase().includes(term))
      );
    }
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(w => w.status === this.filterStatus);
    }
    return filtered;
  }

  addWarehouse(): void {
    this.router.navigate(['/warehouses/add']);
  }

  editWarehouse(warehouse: Warehouse): void {
    if (warehouse.id) {
      this.router.navigate(['/warehouses/edit', warehouse.id]);
    }
  }

  deleteWarehouse(warehouse: Warehouse): void {
    if (!warehouse.id) return;
    const warehouseId = warehouse.id;
    this.alert.delete('ALERT.ENTITY.WAREHOUSE', warehouse.name).then(result => {
      if (!result.isConfirmed) return;
      this.warehouseService.deleteWarehouse(warehouseId).subscribe({
        next: () => {
          this.loadWarehouses();
          this.alert.success('ALERT.DELETED_SUCCESS');
        },
        error: (err) => this.alert.error(err, 'ALERT.DELETE_FAILED')
      });
    });
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'badge bg-success' : 'badge bg-secondary';
  }
}
