import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from 'src/app/services/inventory.service';
import { ProductService } from 'src/app/services/product.service';
import { WarehouseService } from 'src/app/services/warehouse.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-wastage-record',
  templateUrl: './add-wastage-record.component.html',
  styleUrls: ['./add-wastage-record.component.css']
})
export class AddWastageRecordComponent implements OnInit {
  recordForm: FormGroup;
  isEdit = false;
  recordId: number | null = null;
  loading = false;
  products: any[] = [];
  warehouses: any[] = [];
  wastageTypes = ['PRODUCTION', 'STORAGE', 'HANDLING', 'EXPIRED', 'DAMAGED', 'RETURN', 'OTHER'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {
    this.recordForm = this.fb.group({
      productId: [null, Validators.required],           
      warehouseId: [null, Validators.required],        
      wastageType: [null, Validators.required],         
      quantity: ['', [Validators.required, Validators.min(0.001)]],
      wastageDate: [new Date().toISOString().split('T')[0], Validators.required],
      reason: [''],
      batchNo: [''],
      manufacturingDate: [''],
      expiryDate: [''],
      financialLoss: [0, Validators.min(0)],
      recoveryAmount: [0, Validators.min(0)],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.recordId = +id;
      this.loadRecord();
    }
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

  loadRecord(): void {
    this.loading = true;
    this.inventoryService.getWastageRecordById(this.recordId!).subscribe({
      next: (data) => {
        this.recordForm.patchValue({
          productId: data.productId,
          warehouseId: data.warehouseId,
          wastageType: data.wastageType,
          quantity: data.quantity,
          wastageDate: data.wastageDate,
          reason: data.reason,
          batchNo: data.batchNo,
          manufacturingDate: data.manufacturingDate,
          expiryDate: data.expiryDate,
          financialLoss: data.financialLoss,
          recoveryAmount: data.recoveryAmount,
          notes: data.notes
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load record', 'error');
        this.router.navigate(['/inventory/wastage/records']);
      }
    });
  }

  save(): void {
    if (this.recordForm.invalid) {
      Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
      return;
    }

    const formValue = this.recordForm.value;
    
    // convert undefined/null to proper values
    const data = {
      productId: formValue.productId ? Number(formValue.productId) : null,
      warehouseId: formValue.warehouseId ? Number(formValue.warehouseId) : null,
      wastageType: formValue.wastageType || null,
      quantity: formValue.quantity ? Number(formValue.quantity) : 0,
      wastageDate: formValue.wastageDate || null,
      reason: formValue.reason || null,
      batchNo: formValue.batchNo || null,
      manufacturingDate: formValue.manufacturingDate || null,
      expiryDate: formValue.expiryDate || null,
      financialLoss: formValue.financialLoss ? Number(formValue.financialLoss) : 0,
      recoveryAmount: formValue.recoveryAmount ? Number(formValue.recoveryAmount) : 0,
      notes: formValue.notes || null,
      companyId: 1,        // Add default companyId
      createdBy: 1,        // Add default createdBy
      status: 'PENDING'    // Add default status
    };

    
    this.loading = true;

    if (this.isEdit && this.recordId) {
      this.inventoryService.updateWastageRecord(this.recordId, data).subscribe({
        next: () => {
          Swal.fire('Success', 'Record updated', 'success');
          this.router.navigate(['/inventory/wastage/records']);
        },
        error: (err) => {
          this.loading = false;
          Swal.fire('Error', 'Update failed: ' + (err.error?.message || 'Server error'), 'error');
        }
      });
    } else {
      this.inventoryService.createWastageRecord(data).subscribe({
        next: () => {
          Swal.fire('Success', 'Record created', 'success');
          this.router.navigate(['/inventory/wastage/records']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Create error:', err);
          Swal.fire('Error', 'Creation failed: ' + (err.error?.message || 'Server error'), 'error');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/inventory/wastage/records']);
  }
}