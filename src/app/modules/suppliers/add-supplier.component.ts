import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Cropper from 'cropperjs';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../models/supplier.model';
import { SweetAlertService } from '../../services/sweet-alert.service';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.css']
})
export class AddSupplierComponent implements OnInit, OnDestroy {
  @ViewChild('supplierCropperImage') supplierCropperImage?: ElementRef<HTMLImageElement>;

  supplier: Supplier = new Supplier();
  isEdit = false;
  loading = false;
  selectedPhotoFile: File | null = null;
  photoPreviewUrl = '';
  existingPhotoPreviewUrl = '';
  photoError = '';
  cropModalOpen = false;
  cropImageUrl = '';
  cropZoom = 1;
  private cropSourceFile: File | null = null;
  private cropper: Cropper | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supplierService: SupplierService,
    private cdr: ChangeDetectorRef,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.isEdit = true;
        this.loadSupplier(id);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  loadSupplier(id: number): void {
    this.loading = true;
    this.supplierService.getSupplierById(id).subscribe({
      next: (data) => {
        this.supplier = data;
        this.photoPreviewUrl = '';
        this.existingPhotoPreviewUrl = this.supplierService.getSupplierPhotoUrl(data.photoUrl);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/suppliers']);
      }
    });
  }

  save(): void {
    if (!this.supplier.supplierCode || !this.supplier.supplierName) {
      this.alert.warning('ALERT.VALIDATION.SUPPLIER_REQUIRED');
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      if (!this.supplier.supplierId) {
        this.alert.error(null, 'ALERT.MISSING_UPDATE_ID');
        this.loading = false;
        return;
      }
      this.supplierService.updateSupplierWithPhoto(this.supplier.supplierId, this.supplier, this.selectedPhotoFile).subscribe({
        next: () => this.router.navigate(['/suppliers']),
        error: (err) => this.handleError(err)
      });
    } else {
      this.supplierService.createSupplierWithPhoto(this.supplier, this.selectedPhotoFile).subscribe({
        next: () => this.router.navigate(['/suppliers']),
        error: (err) => this.handleError(err)
      });
    }
  }

  get previewPhotoUrl(): string {
    return this.photoPreviewUrl || this.existingPhotoPreviewUrl || '';
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.setSelectedPhoto(file);
    }
    input.value = '';
  }

  onPhotoDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setSelectedPhoto(file);
    }
  }

  onPhotoDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removePhoto(): void {
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = '';
    this.existingPhotoPreviewUrl = '';
    this.supplier.photoUrl = '';
    this.photoError = '';
  }

  onSupplierCropperImageLoad(): void {
    setTimeout(() => this.initializeCropper(), 0);
  }

  onCropZoomChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const zoom = Number(input.value);
    this.cropZoom = zoom;
    this.cropper?.zoomTo(zoom);
  }

  rotateCrop(degrees: number): void {
    this.cropper?.rotate(degrees);
  }

  resetCrop(): void {
    this.cropper?.reset();
    this.cropZoom = 1;
  }

  cancelCrop(): void {
    this.destroyCropper();
    this.cropModalOpen = false;
    this.cropSourceFile = null;
    this.cropImageUrl = '';
    this.cropZoom = 1;
  }

  async applyCroppedLogo(): Promise<void> {
    if (!this.cropSourceFile) return;

    try {
      let previewFile = this.cropSourceFile;
      if (this.cropper) {
        const canvas = this.cropper.getCroppedCanvas({
          width: 500,
          height: 400,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });
        if (!canvas) {
          throw new Error('Could not create cropped supplier logo');
        }

        const blob = await this.canvasToBlob(canvas);
        const fileName = this.cropSourceFile.name.replace(/\.[^.]+$/, '') + '-supplier-logo.jpg';
        previewFile = new File([blob], fileName, { type: 'image/jpeg' });
      }

      this.selectedPhotoFile = previewFile;
      this.photoPreviewUrl = await this.fileToDataUrl(previewFile);
      this.photoError = '';
      this.destroyCropper();
      this.cropModalOpen = false;
      this.cropSourceFile = null;
      this.cropImageUrl = '';
      this.cropZoom = 1;
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
      this.photoError = 'Could not apply adjusted supplier logo. Please try another image.';
    }
  }

  getSupplierInitials(): string {
    const parts = (this.supplier.supplierName || 'Supplier').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'S';
  }

  private setSelectedPhoto(file: File): void {
    this.photoError = '';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.photoError = 'Only JPG, PNG, and WEBP supplier photos/logos are allowed.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.photoError = 'Supplier photo/logo must be 5MB or smaller.';
      return;
    }
    this.cropSourceFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.cropImageUrl = String(reader.result || '');
      this.cropZoom = 1;
      this.cropModalOpen = true;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  private initializeCropper(): void {
    this.destroyCropper();
    const image = this.supplierCropperImage?.nativeElement;
    if (!image) return;

    this.cropper = new Cropper(image, {
      aspectRatio: 5 / 4,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      responsive: true,
      background: true,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      preview: '.supplier-crop-preview-window',
      ready: () => this.cropZoom = 1,
      zoom: (event) => {
        const ratio = event.detail.ratio;
        this.cropZoom = Math.max(0.5, Math.min(3, Number(ratio.toFixed(2))));
      }
    });
  }

  private destroyCropper(): void {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Could not create cropped supplier logo'));
      }, 'image/jpeg', 0.85);
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not create supplier logo preview'));
      reader.readAsDataURL(file);
    });
  }

  private handleError(err: any): void {
    console.error(err);
    this.alert.error(err);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/suppliers']);
  }
}
