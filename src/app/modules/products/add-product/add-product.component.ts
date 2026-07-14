import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product, ProductStatus } from '../../../models/product.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

  product: Product = new Product();
  isEditMode = false;
  loading = false;
  submitting = false;
  selectedImageFile: File | null = null;
  imagePreviewUrl = '';
  readonly placeholderImage = 'assets/images/placeholder.png';

  statusOptions: ProductStatus[] = ['ACTIVE', 'INACTIVE'];

  selectUnitOptions: { value: string; label: string }[] = [
    { value: 'Piece', label: 'Piece' },
    { value: 'Kg', label: 'Kg' },
    { value: 'Liter', label: 'Liter' }
  ];

  errorMessage = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];

      if (id) {
        this.isEditMode = true;
        this.loadProduct(+id);
      } else {
        this.product = new Product();
        this.product.id = undefined;

        // default value set (optional)
        this.product.selectUnit = 'Piece';
        this.product.status = 'ACTIVE';
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;

    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.imagePreviewUrl = this.productService.getProductImageUrl(data.imageUrl);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load product'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.submitting) return;

    this.submitting = true;

    //  Validation
    if (!this.product.productCode || !this.product.sku || !this.product.productName) {

      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Product Code, SKU and Product Name are required!'
      });

      this.submitting = false;
      return;
    }

    // ================= EDIT =================
    if (this.isEditMode && this.product.id) {

      this.productService.updateProduct(this.product.id, this.product, this.selectedImageFile).subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Product updated successfully',
            timer: 2000,
            showConfirmButton: false
          });

          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 2000);
        },

        error: (err) => {
          this.submitting = false;

          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err.message || 'Something went wrong'
          });
        }

      });

    } else {

      // ================= CREATE =================
      delete this.product.id;

      this.productService.createProduct(this.product, this.selectedImageFile).subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'Product added successfully',
            timer: 2000,
            showConfirmButton: false
          });

          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 2000);
        },

        error: (err) => {
          this.submitting = false;

          Swal.fire({
            icon: 'error',
            title: 'Create Failed',
            text: err.message || 'Something went wrong'
          });
        }

      });
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.errorMessage = '';

    if (!file) {
      this.selectedImageFile = null;
      this.imagePreviewUrl = this.productService.getProductImageUrl(this.product.imageUrl);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.selectedImageFile = null;
      input.value = '';
      Swal.fire('Invalid Image', 'Only JPG, PNG, and WEBP images are allowed.', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.selectedImageFile = null;
      input.value = '';
      Swal.fire('Image Too Large', 'Product image must be 5MB or smaller.', 'warning');
      return;
    }

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreviewUrl = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.placeholderImage;
  }

  //  Cancel button with confirmation
  cancel(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Your changes will be lost!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, leave',
      cancelButtonText: 'Stay'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/products']);
      }
    });
  }
}
