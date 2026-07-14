import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductVariationService } from 'src/app/services/product-variation.service';
import { ProductService } from 'src/app/services/product.service';
import { ProductVariation } from 'src/app/models/product-variation.model';
import { Product } from 'src/app/models/product.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-product-variation-list',
  templateUrl: './product-variation-list.component.html',
  styleUrls: ['./product-variation-list.component.css']
})
export class ProductVariationListComponent implements OnInit {

  variations: ProductVariation[] = [];
  products: Product[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  constructor(
    private variationService: ProductVariationService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadVariations();
  }

  // ================= LOAD PRODUCTS =================
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load products'
        });
      }
    });
  }

  // ================= LOAD VARIATIONS =================
  loadVariations(): void {
    this.loading = true;

    this.variationService.getVariations().subscribe({
      next: (data) => {
        this.variations = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load variations'
        });
      }
    });
  }

  // ================= FILTER =================
  get filteredVariations(): ProductVariation[] {
    let filtered = this.variations;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();

      filtered = filtered.filter(v =>
        (v.sku || '').toLowerCase().includes(term) ||
        (v.variationName || '').toLowerCase().includes(term)
      );
    }

    if (this.filterStatus !== 'ALL') {
      const active = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(v => v.status === active);
    }

    return filtered;
  }

  // ================= ADD =================
  addVariation(): void {
    this.router.navigate(['./products/variations/add']);
  }

  // ================= EDIT =================
  editVariation(variation: ProductVariation): void {
    if (!variation.variationId) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Variation',
        text: 'Variation ID not found'
      });
      return;
    }

    this.router.navigate(['./products/variations/edit', variation.variationId]);
  }

  // ================= DELETE =================
  deleteVariation(variation: ProductVariation): void {

    if (!variation.variationId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Variation ID missing!'
      });
      return;
    }

    // 🔥 CONFIRM ALERT
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${variation.variationName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {

        this.variationService.deleteVariation(variation.variationId).subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Variation deleted successfully',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadVariations();
          },

          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: err?.message || 'Something went wrong'
            });
          }

        });
      }
    });
  }

  // ================= HELPERS =================
  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.productName : 'Unknown';
  }

  getProduct(productId: number): Product | undefined {
    return this.products.find(p => p.id === Number(productId));
  }

  getVariationImageUrl(variation: ProductVariation): string {
    if (variation.imageUrl) {
      return this.variationService.getVariationImageUrl(variation.imageUrl);
    }
    const product = this.getProduct(variation.productId);
    return product?.imageUrl ? this.productService.getProductImageUrl(product.imageUrl) : '';
  }

  onVariationImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    img.parentElement?.classList.add('variation-image-failed');
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getStatusClass(status: boolean): string {
    return status ? 'badge bg-success' : 'badge bg-secondary';
  }

  getStatusText(status: boolean): string {
    return status ? 'ACTIVE' : 'INACTIVE';
  }
}
