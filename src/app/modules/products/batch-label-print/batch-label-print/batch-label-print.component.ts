import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from 'src/app/models/product.model';
import { BarcodeService } from 'src/app/services/barcode.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-batch-label-print',
  templateUrl: './batch-label-print.component.html',
  styleUrls: ['./batch-label-print.component.css']
})
export class BatchLabelPrintComponent {
  products: Product[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] },
    private dialogRef: MatDialogRef<BatchLabelPrintComponent>,
    private barcodeService: BarcodeService,
    private productService: ProductService
  ) {
    this.products = data.products;
  }

  getBarcodeDataURL(product: Product): string {
    const code = product.productCode || product.sku;
    return this.barcodeService.getBarcodeDataURL(code);
  }

  getProductImageUrl(product: Product): string {
    return this.productService.getProductImageUrl(product.imageUrl);
  }

  onProductImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.productService.getProductImageUrl('');
  }

  // Manually format BDT so labels and print output always use the Taka symbol.
  formatCurrency(amount: number): string {
    const value = Number(amount || 0);
    return `৳${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  printLabels(): void {
    const printContent = document.getElementById('labelPrintArea')?.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent!;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
