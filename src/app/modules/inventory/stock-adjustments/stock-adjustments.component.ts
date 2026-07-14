import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';
import { ProductService } from '../../../services/product.service';
import { WarehouseService } from '../../../services/warehouse.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-stock-adjustments',
  templateUrl: './stock-adjustments.component.html',
  styleUrls: ['./stock-adjustments.component.css']
})
export class StockAdjustmentsComponent implements OnInit {
  adjustments: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  loading = false;
  showForm = false;
  adjustmentForm: FormGroup;
  isEdit = false;
  editingId: number | null = null;
  difference = 0;

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private fb: FormBuilder
  ) {
    this.adjustmentForm = this.fb.group({
      productId: ['', Validators.required],
      warehouseId: ['', Validators.required],
      systemQuantity: [{ value: 0 }],  
      physicalQuantity: ['', [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
    this.loadAdjustments();
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

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  loadWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe(data => this.warehouses = data);
  }

  loadAdjustments(): void {
    this.loading = true;
    this.inventoryService.getAdjustments().subscribe({
      next: (data) => {
        this.adjustments = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load adjustments', 'error');
      }
    });
  }

onProductChange(): void {
  let productId = this.adjustmentForm.get('productId')?.value;
  let warehouseId = this.adjustmentForm.get('warehouseId')?.value;

  // Convert to numbers for accurate comparison
  productId = Number(productId);
  warehouseId = Number(warehouseId);

  console.log('🔍 Product changed (numeric):', { productId, warehouseId });

  if (productId && warehouseId && !isNaN(productId) && !isNaN(warehouseId)) {
    this.inventoryService.getInventory().subscribe({
      next: (stocks) => {
        console.log('📦 Inventory data from backend:', stocks);

        // Find matching stock (exact numeric match)
        const stock = stocks.find(s => 
          Number(s.productId) === productId && Number(s.warehouseId) === warehouseId
        );

        const currentQty = stock ? (stock.quantity || 0) : 0;
        console.log('✅ Found stock quantity:', currentQty);

        this.adjustmentForm.patchValue({ systemQuantity: currentQty });
        this.adjustmentForm.get('physicalQuantity')?.setValue(currentQty);
        this.calculateDifference();
      },
      error: (err) => {
        console.error('❌ Failed to load inventory:', err);
        Swal.fire('Warning', 'Could not load current stock', 'warning');
      }
    });
  } else {
    console.warn('Invalid productId or warehouseId');
  }
}

  onWarehouseChange(): void {
    this.onProductChange();
  }

  calculateDifference(): void {
    const system = this.adjustmentForm.get('systemQuantity')?.value || 0;
    const physical = this.adjustmentForm.get('physicalQuantity')?.value || 0;
    this.difference = physical - system;
  }

  openCreateForm(): void {
    this.isEdit = false;
    this.editingId = null;
    this.adjustmentForm.reset({
      productId: '',
      warehouseId: '',
      systemQuantity: 0,
      physicalQuantity: 0,
      reason: '',
      notes: ''
    });
    this.difference = 0;
    this.showForm = true;
  }

  editAdjustment(adj: any): void {
    this.isEdit = true;
    this.editingId = adj.adjustmentId;
    this.adjustmentForm.patchValue({
      productId: adj.productId,
      warehouseId: adj.warehouseId,
      systemQuantity: adj.systemQuantity,
      physicalQuantity: adj.physicalQuantity,
      reason: adj.reason,
      notes: adj.notes
    });
    this.difference = adj.difference;
    this.showForm = true;
  }

  saveAdjustment(): void {
    if (this.adjustmentForm.invalid) {
      Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
      return;
    }

    const formValue = this.adjustmentForm.value;
    const data = {
      productId: formValue.productId,
      warehouseId: formValue.warehouseId,
      systemQuantity: formValue.systemQuantity,
      physicalQuantity: formValue.physicalQuantity,
      difference: this.difference,
      reason: formValue.reason,
      notes: formValue.notes,
      adjustmentDate: new Date().toISOString().split('T')[0],
      companyId: 1,
      status: 'PENDING'
    };

    if (this.isEdit && this.editingId) {
      this.inventoryService.updateAdjustment(this.editingId, data).subscribe({
        next: () => {
          Swal.fire('Success', 'Adjustment updated', 'success');
          this.loadAdjustments();
          this.showForm = false;
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Update failed', 'error');
        }
      });
    } else {
      this.inventoryService.createAdjustment(data).subscribe({
        next: () => {
          Swal.fire('Success', 'Adjustment created', 'success');
          this.loadAdjustments();
          this.showForm = false;
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Creation failed', 'error');
        }
      });
    }
  }

  approveAdjustment(id: number): void {
    Swal.fire({
      title: 'Approve Adjustment?',
      text: 'This will update the stock quantity.',
      icon: 'question',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.inventoryService.approveAdjustment(id, 1).subscribe({
          next: () => {
            Swal.fire('Approved', 'Stock has been updated', 'success');
            this.loadAdjustments();
          },
          error: () => Swal.fire('Error', 'Approval failed', 'error')
        });
      }
    });
  }

  rejectAdjustment(id: number): void {
    Swal.fire({
      title: 'Reject Adjustment?',
      input: 'text',
      inputLabel: 'Reason for rejection',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed && result.value) {
        this.inventoryService.rejectAdjustment(id, result.value).subscribe({
          next: () => {
            Swal.fire('Rejected', 'Adjustment rejected', 'success');
            this.loadAdjustments();
          },
          error: () => Swal.fire('Error', 'Rejection failed', 'error')
        });
      }
    });
  }

  getStatusBadge(status: string): string {
    switch(status) {
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-warning';
    }
  }
}
