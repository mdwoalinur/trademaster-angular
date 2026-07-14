import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Cropper from 'cropperjs';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/models/customer.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.css']
})
export class AddCustomerComponent implements OnInit, OnDestroy {
  @ViewChild('cropperImage') cropperImage?: ElementRef<HTMLImageElement>;

  customer: Customer = new Customer();
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

  customerTypes = ['RETAIL', 'WHOLESALE', 'CORPORATE'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.isEdit = true;
        this.loadCustomer(id);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  get previewPhotoUrl(): string {
    return this.photoPreviewUrl || this.existingPhotoPreviewUrl || '';
  }

  loadCustomer(id: number): void {
    this.loading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (data) => {
        this.customer = data;
        this.photoPreviewUrl = '';
        this.existingPhotoPreviewUrl = this.customerService.getCustomerPhotoUrl(data.photoUrl);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/customers']);
      }
    });
  }

  save(): void {
    if (!this.customer.customerCode || !this.customer.customerName) {
      this.alert.warning('ALERT.VALIDATION.CUSTOMER_REQUIRED');
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      if (!this.customer.customerId) {
        this.alert.error(null, 'ALERT.MISSING_UPDATE_ID');
        this.loading = false;
        return;
      }
      this.customerService.updateCustomerWithPhoto(this.customer.customerId, this.customer, this.selectedPhotoFile).subscribe({
        next: () => this.router.navigate(['/customers']),
        error: (err) => this.handleError(err)
      });
    } else {
      this.customerService.createCustomerWithPhoto(this.customer, this.selectedPhotoFile).subscribe({
        next: () => this.router.navigate(['/customers']),
        error: (err) => this.handleError(err)
      });
    }
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
    this.customer.photoUrl = '';
    this.photoError = '';
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

  onCropZoomChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const zoom = Number(input.value);
    this.cropZoom = zoom;
    this.cropper?.zoomTo(zoom);
  }

  async applyCroppedPhoto(): Promise<void> {
    if (!this.cropSourceFile) return;

    try {
      let previewFile = this.cropSourceFile;
      if (this.cropper) {
        const canvas = this.cropper.getCroppedCanvas({
          width: 400,
          height: 400,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });
        if (!canvas) {
          throw new Error('Could not create cropped canvas');
        }
        const blob = await this.canvasToBlob(canvas);
        const fileName = this.cropSourceFile.name.replace(/\.[^.]+$/, '') + '-cropped.jpg';
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
      this.photoError = 'Could not apply adjusted photo. Please try another image.';
    }
  }

  onCropperImageLoad(): void {
    setTimeout(() => this.initializeCropper(), 0);
  }

  getCustomerInitials(): string {
    const parts = (this.customer.customerName || 'Customer').trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'C';
  }

  private setSelectedPhoto(file: File): void {
    this.photoError = '';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.photoError = 'Only JPG, PNG, and WEBP photos are allowed.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.photoError = 'Customer photo must be 5MB or smaller.';
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
    const image = this.cropperImage?.nativeElement;
    if (!image) return;

    this.cropper = new Cropper(image, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.75,
      responsive: true,
      background: true,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      preview: '.customer-crop-preview-window',
      ready: () => {
        this.cropZoom = 1;
      },
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
        else reject(new Error('Could not create cropped photo'));
      }, 'image/jpeg', 0.85);
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not create photo preview'));
      reader.readAsDataURL(file);
    });
  }

  private handleError(err: any): void {
    console.error(err);
    this.alert.error(err);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }
}
