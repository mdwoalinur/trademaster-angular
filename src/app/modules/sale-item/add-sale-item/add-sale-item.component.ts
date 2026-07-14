import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleItemService } from 'src/app/services/sale-item.service';
import { SaleService } from 'src/app/services/sale.service';
import { ProductService } from 'src/app/services/product.service';
import { SaleItem } from 'src/app/models/sale-item.model';
import { Sale } from 'src/app/models/sale.model';
import { Product } from 'src/app/models/product.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-add-sale-item',
  templateUrl: './add-sale-item.component.html',
  styleUrls: ['./add-sale-item.component.css']
})
export class AddSaleItemComponent implements OnInit {
  saleItem: SaleItem = new SaleItem();
  sales: Sale[] = [];
  products: Product[] = [];
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private saleItemService: SaleItemService,
    private saleService: SaleService,
    private productService: ProductService,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadProducts();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.isEdit = true;
        this.loadSaleItem(id);
      }
    }
  }

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (data) => this.sales = data,
      error: (err) => console.error(err)
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }

  loadSaleItem(id: number): void {
    this.loading = true;
    this.saleItemService.getSaleItemById(id).subscribe({
      next: (data) => {
        this.saleItem = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        //  Updated to nested route
        this.router.navigate(['/sales/items']);
      }
    });
  }

  calculate(): void {
    const subtotal = this.saleItem.unitPrice * this.saleItem.quantity;
    this.saleItem.discountAmount = subtotal * this.saleItem.discountPercent / 100;
    this.saleItem.totalPrice = subtotal - this.saleItem.discountAmount;
  }

  save(): void {
    if (!this.saleItem.saleId || !this.saleItem.productId || this.saleItem.quantity <= 0) {
      this.alert.warning('ALERT.VALIDATION.SALE_ITEM_REQUIRED');
      return;
    }

    this.calculate();
    this.loading = true;

    if (this.isEdit) {
      if (!this.saleItem.salesItemId) {
        this.alert.error(null, 'ALERT.MISSING_UPDATE_ID');
        this.loading = false;
        return;
      }
      this.saleItemService.updateSaleItem(this.saleItem.salesItemId, this.saleItem).subscribe({
        next: () => {
          // Updated to nested route
          this.router.navigate(['/sales/items']);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.saleItemService.createSaleItem(this.saleItem).subscribe({
        next: () => {
          // Updated to nested route
          this.router.navigate(['/sales/items']);
        },
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
    //Updated to nested route
    this.router.navigate(['/sales/items']);
  }
}
