import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { BarcodeService } from '../../../services/barcode.service';
import { Product } from '../../../models/product.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  // Track selected product IDs (no need to modify Product model)
  selectedProductIds: Set<number> = new Set();

  constructor(
    private productService: ProductService,
    public router: Router,
    private barcodeService: BarcodeService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to load products' });
      }
    });
  }

  get filteredProducts(): Product[] {
    let filtered = this.products;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(term) ||
        p.productCode.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
      );
    }
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === this.filterStatus);
    }
    return filtered;
  }

  // Selection helpers
  isSelected(productId: number): boolean {
    return this.selectedProductIds.has(productId);
  }

  toggleSelection(productId: number, event: any): void {
    if (event.target.checked) {
      this.selectedProductIds.add(productId);
    } else {
      this.selectedProductIds.delete(productId);
    }
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.filteredProducts.forEach(p => p.id && this.selectedProductIds.add(p.id));
    } else {
      this.filteredProducts.forEach(p => p.id && this.selectedProductIds.delete(p.id));
    }
  }

  get selectedProducts(): Product[] {
    return this.filteredProducts.filter(p => p.id && this.selectedProductIds.has(p.id));
  }

  // Batch label print (currency fixed)
  printBatchLabels(): void {
    if (this.selectedProducts.length === 0) {
      Swal.fire('No selection', 'Please select at least one product', 'warning');
      return;
    }

    let html = '<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">';
    for (const product of this.selectedProducts) {
      const code = product.productCode || product.sku;
      const canvasId = `barcodeCanvas_${product.id}`;
      const formattedPrice = this.formatBatchLabelPrice(product.sellingPrice);
      html += `
        <div style="width: 200px; border: 1px solid #ddd; border-radius: 8px; padding: 8px; text-align: center;">
          <canvas id="${canvasId}" style="width: 100%;"></canvas>
          <div style="font-weight: bold; margin-top: 6px;">${this.escapeHtml(product.productName)}</div>
          <div>${formattedPrice}</div>
          <div style="font-size: 10px; color: #666;">SKU: ${code}</div>
        </div>
      `;
    }
    html += '</div>';

    Swal.fire({
      title: 'Batch Labels',
      html: html,
      width: '90%',
      showConfirmButton: true,
      confirmButtonText: 'Print',
      showCancelButton: true,
      didOpen: () => {
        for (const product of this.selectedProducts) {
          const code = product.productCode || product.sku;
          const canvas = document.getElementById(`barcodeCanvas_${product.id}`) as HTMLCanvasElement;
          if (canvas) this.barcodeService.generateBarcode(canvas.id, code);
        }
      },
      preConfirm: () => {
        const printContent = document.createElement('div');
        printContent.innerHTML = html;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
      }
    });
  }

  private formatBatchLabelPrice(amount: number): string {
    const value = Number(amount || 0);
    return `৳${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Single barcode show
  showBarcode(product: Product): void {
    const code = product.productCode || product.sku;
    Swal.fire({
      title: `Barcode for ${product.productName}`,
      html: `<canvas id="barcodeCanvas" style="margin: 20px auto;"></canvas><br><strong>Code:</strong> ${code}`,
      width: '400px',
      didOpen: () => {
        const canvas = document.getElementById('barcodeCanvas') as HTMLCanvasElement;
        if (canvas) this.barcodeService.generateBarcode('barcodeCanvas', code);
      }
    });
  }

  editProduct(product: Product) {
    if (!product.id) return;
    this.router.navigate(['/products/edit', product.id]);
  }

  deleteProduct(product: Product) {
    const id = product.id;
    if (!id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${product.productName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Product deleted', timer: 2000, showConfirmButton: false });
            this.loadProducts();
          },
          error: (err) => Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.message || 'Something went wrong' })
        });
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }

  getProductImageUrl(product: Product): string {
    return this.productService.getProductImageUrl(product.imageUrl);
  }

  onProductImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }

  private escapeHtml(str: string): string {
    return str.replace(/[&<>]/g, m => {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
}
