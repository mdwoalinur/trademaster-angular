import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from 'src/app/services/sale.service';
import { SaleItemService } from 'src/app/services/sale-item.service';
import { SaleReturnService } from 'src/app/services/sale-return.service';
import { ProductService } from 'src/app/services/product.service';
import { SaleReturn, ReturnType } from 'src/app/models/sale-return.model';
import { SaleReturnItem } from 'src/app/models/sale-return-item.model';
import { Product } from 'src/app/models/product.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
    selector: 'app-add-edit-sale-return',
    templateUrl: './add-edit-sale-return.component.html',
    styleUrls: ['./add-edit-sale-return.component.css']
})
export class AddEditSaleReturnComponent implements OnInit {
    returnForm: FormGroup;
    saleId: number | null = null;
    sale: any = null;
    saleItems: any[] = [];
    products: Product[] = [];
    loading = false;
    submitting = false;

    returnTypes: ReturnType[] = ['FULL', 'PARTIAL'];
    itemConditions = ['GOOD', 'DAMAGED', 'EXPIRED'];
    actions = ['REFUND', 'EXCHANGE', 'STORE_CREDIT'];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private saleService: SaleService,
        private saleItemService: SaleItemService,
        private productService: ProductService,
        private returnService: SaleReturnService
    ) {
        this.returnForm = this.fb.group({
            returnType: ['FULL', Validators.required],
            reason: [''],
            notes: [''],
            items: this.fb.array([])
        });
    }

    ngOnInit(): void {
        const saleIdParam = this.route.snapshot.paramMap.get('saleId');
        if (!saleIdParam) {
            Swal.fire('Error', 'No sale ID provided', 'error');
            this.router.navigate(['/sales']);
            return;
        }
        this.saleId = +saleIdParam;
        this.loadProducts();
        this.loadSale();
    }

    get itemsArray(): FormArray {
        return this.returnForm.get('items') as FormArray;
    }

    get totalRefundAmount(): number {
        let total = 0;
        for (let i = 0; i < this.itemsArray.length; i++) {
            total += this.itemsArray.at(i).get('refundAmount')?.value || 0;
        }
        return total;
    }

    loadProducts(): void {
        this.productService.getProducts().subscribe({
            next: products => {
                this.products = products;
                this.updateReturnItemProductMeta();
            },
            error: err => console.error('Failed to load products:', err)
        });
    }

    loadSale(): void {
        this.loading = true;
        this.saleService.getSaleById(this.saleId!).subscribe({
            next: (sale: any) => {
                this.sale = sale;
                this.loadSaleItems();
            },
            error: () => {
                Swal.fire('Error', 'Sale not found', 'error');
                this.router.navigate(['/sales']);
            }
        });
    }

    loadSaleItems(): void {
        // Using the separate SaleItemService
        this.saleItemService.getSaleItemsBySaleId(this.saleId!).subscribe({
            next: (items: any[]) => {
                this.saleItems = items;
                if (this.saleItems.length === 0) {
                    Swal.fire('Warning', 'This sale has no items to return', 'warning');
                    this.router.navigate(['/sales-returns']);
                    return;
                }
                this.initItemsForm();
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                Swal.fire('Error', 'Failed to load sale items', 'error');
                this.loading = false;
            }
        });
    }

    initItemsForm(): void {
        for (let item of this.saleItems) {
            const group = this.fb.group({
                productId: [item.productId],
                productName: [item.productName || ''],
                imageUrl: [this.getProductImageUrl(item.productId)],
                sku: [this.getProductSku(item.productId)],
                originalQuantity: [item.quantity],
                returnedQuantity: [0, [Validators.required, Validators.min(0), Validators.max(item.quantity)]],
                unitPrice: [item.unitPrice],
                refundAmount: [{ value: 0, disabled: true }],
                reason: [''],
                itemCondition: ['GOOD'],
                actionTaken: ['REFUND']
            });

            group.get('returnedQuantity')?.valueChanges.subscribe(() => this.updateItemRefund(group));
            group.get('itemCondition')?.valueChanges.subscribe(() => this.updateItemRefund(group));

            this.itemsArray.push(group);
        }
    }

    updateItemRefund(group: FormGroup): void {
        const qty = group.get('returnedQuantity')?.value || 0;
        const price = group.get('unitPrice')?.value || 0;
        const condition = group.get('itemCondition')?.value;
        let refund = qty * price;
        if (condition === 'DAMAGED') refund = refund * 0.5;
        else if (condition === 'EXPIRED') refund = 0;
        group.get('refundAmount')?.setValue(refund, { emitEvent: false });
    }

    onSubmit(): void {
        const hasReturn = this.itemsArray.controls.some(c => (c.get('returnedQuantity')?.value || 0) > 0);
        if (!hasReturn) {
            Swal.fire('Validation', 'At least one item must have a returned quantity > 0', 'warning');
            return;
        }

        this.submitting = true;

        const saleReturn: SaleReturn = {
            saleId: this.saleId!,
            customerId: this.sale?.customerId ?? 0,
            warehouseId: this.sale?.warehouseId ?? 0,
            totalReturnAmount: this.totalRefundAmount,
            refundAmount: this.totalRefundAmount,
            exchangeAmount: 0,
            reason: this.returnForm.value.reason ?? '',
            returnType: this.returnForm.value.returnType ?? 'FULL',
            status: 'PENDING',
            createdBy: 1,
            notes: this.returnForm.value.notes ?? ''
        };

        const items: SaleReturnItem[] = [];
        for (let i = 0; i < this.itemsArray.length; i++) {
            const group = this.itemsArray.at(i);
            const qty = group.get('returnedQuantity')?.value;
            if (qty && qty > 0) {
                items.push({
                    productId: group.get('productId')?.value ?? 0,
                    returnedQuantity: qty,
                    unitPrice: group.get('unitPrice')?.value ?? 0,
                    refundAmount: group.get('refundAmount')?.value ?? 0,
                    reason: group.get('reason')?.value ?? '',
                    itemCondition: group.get('itemCondition')?.value ?? 'GOOD',
                    actionTaken: group.get('actionTaken')?.value ?? 'REFUND'
                });
            }
        }

        this.returnService.create(saleReturn, items).subscribe({
            next: () => {
                Swal.fire('Success', 'Return request created', 'success');
                this.router.navigate(['/sales-returns']);
            },
            error: (err) => {
                console.error(err);
                Swal.fire('Error', err.error?.message || 'Creation failed', 'error');
                this.submitting = false;
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/sales-returns']);
    }

    updateReturnItemProductMeta(): void {
        for (let i = 0; i < this.itemsArray.length; i++) {
            const group = this.itemsArray.at(i);
            const productId = group.get('productId')?.value;
            group.patchValue({
                imageUrl: this.getProductImageUrl(productId),
                sku: this.getProductSku(productId)
            }, { emitEvent: false });
        }
    }

    getProduct(productId: number): Product | undefined {
        return this.products.find(p => p.id === productId);
    }

    getProductImageUrl(productId: number): string {
        return this.getProduct(productId)?.imageUrl || '';
    }

    getProductSku(productId: number): string {
        const product = this.getProduct(productId);
        return product?.sku || product?.productCode || '';
    }
}
