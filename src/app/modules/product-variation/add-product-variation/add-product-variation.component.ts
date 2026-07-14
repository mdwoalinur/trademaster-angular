import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductVariationService } from 'src/app/services/product-variation.service';
import { ProductService } from 'src/app/services/product.service';
import { ProductVariation } from 'src/app/models/product-variation.model';
import { Product } from 'src/app/models/product.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-add-product-variation',
  templateUrl: './add-product-variation.component.html',
  styleUrls: ['./add-product-variation.component.css']
})
export class AddProductVariationComponent implements OnInit {
  variation: ProductVariation = new ProductVariation();
  products: Product[] = [];
  isEdit = false;
  loading = false;
  selectedImageFile: File | null = null;
  imagePreviewUrl = '';
  existingImagePreviewUrl = '';
  imageError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private variationService: ProductVariationService,
    private productService: ProductService,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.isEdit = true;
        this.loadVariation(id);
      }
    }
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }

  loadVariation(id: number): void {
    this.loading = true;
    this.variationService.getVariationById(id).subscribe({
      next: (data) => {
        this.variation = data;
        this.imagePreviewUrl = '';
        this.existingImagePreviewUrl = this.variationService.getVariationImageUrl(data.imageUrl) || this.getProductImageUrl(data.productId);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.router.navigate(['/products/variations']);
      }
    });
  }

  save(): void {
    if (!this.variation.productId || !this.variation.sku) {
      this.alert.warning('ALERT.VALIDATION.PRODUCT_SKU_REQUIRED');
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      if (!this.variation.variationId) {
        this.alert.error(null, 'ALERT.MISSING_UPDATE_ID');
        this.loading = false;
        return;
      }
      this.variationService.updateVariationWithImage(this.variation.variationId, this.variation, this.selectedImageFile).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/products/variations']);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.variationService.createVariationWithImage(this.variation, this.selectedImageFile).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/products/variations']);
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  get previewImageUrl(): string {
    return this.imagePreviewUrl || this.existingImagePreviewUrl || this.getProductImageUrl(this.variation.productId);
  }

  get selectedProduct(): Product | undefined {
    return this.products.find(p => p.id === Number(this.variation.productId));
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.setSelectedImage(file);
    }
    input.value = '';
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setSelectedImage(file);
    }
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreviewUrl = '';
    this.existingImagePreviewUrl = '';
    this.variation.imageUrl = '';
    this.imageError = '';
  }

  getProductImageUrl(productId: number): string {
    const product = this.products.find(p => p.id === Number(productId));
    return product?.imageUrl ? this.productService.getProductImageUrl(product.imageUrl) : '';
  }

  private setSelectedImage(file: File): void {
    this.imageError = '';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Only JPG, PNG, and WEBP variation images are allowed.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError = 'Variation image must be 5MB or smaller.';
      return;
    }
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreviewUrl = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  private handleError(err: any): void {
    console.error(err);
    this.alert.error(err);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/products/variations']);
  }
}
