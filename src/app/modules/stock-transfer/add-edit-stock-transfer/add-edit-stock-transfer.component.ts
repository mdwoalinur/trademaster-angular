import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WarehouseService } from 'src/app/services/warehouse.service';
import { ProductService } from 'src/app/services/product.service';
import { StockTransferService } from 'src/app/services/stock-transfer.service';
import { StockTransfer, StockTransferItem } from 'src/app/models/stock-transfer.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
    selector: 'app-add-edit-stock-transfer',
    templateUrl: './add-edit-stock-transfer.component.html',
    styleUrls: ['./add-edit-stock-transfer.component.css']
})
export class AddEditStockTransferComponent implements OnInit {
    transferForm: FormGroup;
    warehouses: any[] = [];
    products: any[] = [];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private warehouseService: WarehouseService,
        private productService: ProductService,
        private transferService: StockTransferService
    ) {
        this.transferForm = this.fb.group({
            fromWarehouseId: ['', Validators.required],
            toWarehouseId: ['', Validators.required],
            reason: [''],
            notes: [''],
            items: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.loadWarehouses();
        this.loadProducts();
        this.addItem();
    }

    get itemsArray(): FormArray {
        return this.transferForm.get('items') as FormArray;
    }

    loadWarehouses(): void {
        this.warehouseService.getWarehouses().subscribe(data => this.warehouses = data);
    }

    loadProducts(): void {
        this.productService.getProducts().subscribe(data => this.products = data);
    }

    addItem(): void {
        const itemGroup = this.fb.group({
            productId: ['', Validators.required],
            quantity: ['', [Validators.required, Validators.min(1)]]
        });
        this.itemsArray.push(itemGroup);
    }

    removeItem(index: number): void {
        this.itemsArray.removeAt(index);
    }

    onSubmit(): void {
        if (this.transferForm.invalid) {
            Swal.fire('Validation', 'Please fill all required fields', 'warning');
            return;
        }

        const formValue = this.transferForm.value;
        const transfer: StockTransfer = {
            fromWarehouseId: formValue.fromWarehouseId,
            toWarehouseId: formValue.toWarehouseId,
            reason: formValue.reason,
            notes: formValue.notes,
            status: 'PENDING',
            items: []
        };

        const items: StockTransferItem[] = [];
        for (let i = 0; i < this.itemsArray.length; i++) {
            const grp = this.itemsArray.at(i);
            items.push({
                productId: grp.get('productId')?.value,
                quantity: grp.get('quantity')?.value
            });
        }

        this.transferService.create(transfer, items).subscribe({
            next: () => {
                Swal.fire('Success', 'Stock transfer created', 'success');
                this.router.navigate(['/stock-transfers']);
            },
            error: () => Swal.fire('Error', 'Creation failed', 'error')
        });
    }

    // Add this method
    cancel(): void {
        this.router.navigate(['/stock-transfers']);
    }
}