import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';
import { SweetAlertService } from '../../services/sweet-alert.service';

@Component({
  selector: 'app-add-warehouse',
  templateUrl: './add-warehouse.component.html',
  styleUrls: ['./add-warehouse.component.css']
})
export class AddWarehouseComponent implements OnInit {
  warehouse: Warehouse = {
    warehouseCode: '',
    name: '',
    location: '',
    status: 'ACTIVE',
    capacity: 0,
    managerName: '',
    contactPhone: '',
    contactEmail: ''
  };
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.isEdit = true;
        this.loadWarehouse(id);
      }
    }
  }

  loadWarehouse(id: number): void {
    this.loading = true;
    this.warehouseService.getWarehouseById(id).subscribe({
      next: (data) => {
        this.warehouse = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/warehouses']);
      }
    });
  }

  save(): void {
    if (!this.warehouse.warehouseCode || !this.warehouse.name) {
      this.alert.warning('ALERT.VALIDATION.WAREHOUSE_REQUIRED');
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      if (!this.warehouse.id) {
        this.alert.error(null, 'ALERT.MISSING_UPDATE_ID');
        this.loading = false;
        return;
      }
      this.warehouseService.updateWarehouse(this.warehouse.id, this.warehouse).subscribe({
        next: () => this.router.navigate(['/warehouses']),
        error: (err) => this.handleError(err)
      });
    } else {
      // Create: remove id if present
      const { id, ...newWarehouse } = this.warehouse;
      this.warehouseService.createWarehouse(newWarehouse as Warehouse).subscribe({
        next: () => this.router.navigate(['/warehouses']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    console.error(err);
    this.alert.error(err);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/warehouses']);
  }
}
