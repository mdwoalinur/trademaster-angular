import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  CameraDevice,
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeSupportedFormats
} from 'html5-qrcode';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.css']
})
export class BarcodeScannerComponent implements AfterViewInit, OnDestroy {
  @Output() codeScanned = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  readonly readerId = 'tm-barcode-reader';
  cameras: CameraDevice[] = [];
  selectedCameraIndex = 0;
  manualCode = '';
  statusKey = 'BARCODE.STARTING';
  errorKey = '';
  starting = false;
  running = false;
  torchSupported = false;
  torchEnabled = false;

  private scanner: Html5Qrcode | null = null;
  private destroyed = false;
  private scanLocked = false;
  private stopping: Promise<void> | null = null;

  constructor(
    private dialogRef: MatDialogRef<BarcodeScannerComponent>,
    private alert: SweetAlertService
  ) {
    this.dialogRef.beforeClosed().subscribe(() => void this.stopScanner());
  }

  ngAfterViewInit(): void {
    setTimeout(() => void this.initializeScanner(), 0);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    void this.stopScanner();
  }

  async retry(): Promise<void> {
    this.errorKey = '';
    this.scanLocked = false;
    await this.stopScanner();
    await this.initializeScanner();
  }

  async switchCamera(): Promise<void> {
    if (this.cameras.length < 2 || this.starting) return;
    this.selectedCameraIndex = (this.selectedCameraIndex + 1) % this.cameras.length;
    this.scanLocked = false;
    await this.stopScanner();
    await this.startCamera(this.cameras[this.selectedCameraIndex].id);
  }

  async toggleTorch(): Promise<void> {
    if (!this.scanner || !this.running || !this.torchSupported) return;
    try {
      const torch = this.scanner.getRunningTrackCameraCapabilities().torchFeature();
      const nextValue = !this.torchEnabled;
      await torch.apply(nextValue);
      this.torchEnabled = nextValue;
    } catch (error) {
      console.warn('Unable to change camera torch state', error);
      this.torchSupported = false;
      this.torchEnabled = false;
    }
  }

  submitManualCode(): void {
    void this.acceptCode(this.manualCode);
  }

  async closeDialog(): Promise<void> {
    await this.stopScanner();
    this.close.emit();
    this.dialogRef.close();
  }

  private async initializeScanner(): Promise<void> {
    if (this.destroyed || this.starting || this.running || this.scanner) return;

    if (!this.isCameraContextAllowed()) {
      this.handleCameraError('BARCODE.INSECURE_CONNECTION');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.handleCameraError('BARCODE.UNSUPPORTED_BROWSER');
      return;
    }

    this.starting = true;
    this.statusKey = 'BARCODE.STARTING';
    try {
      this.cameras = await Html5Qrcode.getCameras();
      if (this.destroyed) return;
      if (!this.cameras.length) {
        this.handleCameraError('BARCODE.NO_CAMERA');
        return;
      }

      this.selectedCameraIndex = this.preferredCameraIndex(this.cameras);
      await this.startCamera(this.cameras[this.selectedCameraIndex].id);
    } catch (error) {
      console.error('Barcode camera initialization failed', error);
      this.handleCameraError(this.cameraErrorKey(error));
    } finally {
      this.starting = false;
    }
  }

  private async startCamera(cameraId: string): Promise<void> {
    if (this.destroyed || this.running) return;

    this.starting = true;
    this.errorKey = '';
    this.statusKey = 'BARCODE.STARTING';
    this.scanner = new Html5Qrcode(this.readerId, {
      verbose: false,
      useBarCodeDetectorIfSupported: true,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE
      ]
    });

    const config: Html5QrcodeCameraScanConfig = {
      fps: 12,
      aspectRatio: 16 / 9,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) =>
        this.scanRegion(viewfinderWidth, viewfinderHeight)
    };

    try {
      await this.scanner.start(
        cameraId,
        config,
        decodedText => void this.acceptCode(decodedText),
        () => undefined
      );
      if (this.destroyed) {
        await this.stopScanner();
        return;
      }
      this.running = true;
      this.statusKey = 'BARCODE.SCANNING';
      this.detectTorchSupport();
    } catch (error) {
      console.error('Barcode camera start failed', error);
      await this.stopScanner();
      this.handleCameraError(this.cameraErrorKey(error));
    } finally {
      this.starting = false;
    }
  }

  private async acceptCode(rawCode: string): Promise<void> {
    const code = String(rawCode || '').trim();
    if (!code) {
      this.alert.warning('BARCODE.EMPTY_CODE');
      return;
    }
    if (this.scanLocked) return;

    this.scanLocked = true;
    this.statusKey = 'BARCODE.PROCESSING';
    await this.stopScanner();
    if (this.destroyed) return;
    this.codeScanned.emit(code);
    this.dialogRef.close(code);
  }

  private async stopScanner(): Promise<void> {
    if (this.stopping) return this.stopping;
    const scanner = this.scanner;
    if (!scanner) {
      this.running = false;
      return;
    }

    this.stopping = (async () => {
      try {
        if (scanner.isScanning) await scanner.stop();
      } catch (error) {
        console.debug('Barcode scanner stop skipped', error);
      }
      try {
        scanner.clear();
      } catch (error) {
        console.debug('Barcode scanner clear skipped', error);
      }
      if (this.scanner === scanner) this.scanner = null;
      this.running = false;
      this.torchSupported = false;
      this.torchEnabled = false;
    })().finally(() => this.stopping = null);

    return this.stopping;
  }

  private scanRegion(viewfinderWidth: number, viewfinderHeight: number): { width: number; height: number } {
    const width = Math.max(180, Math.min(440, Math.floor(viewfinderWidth * 0.88)));
    const availableHeight = Math.max(80, viewfinderHeight - 24);
    const height = Math.min(availableHeight, Math.max(90, Math.floor(width * 0.32)));
    return { width: Math.min(width, viewfinderWidth - 8), height };
  }

  private preferredCameraIndex(cameras: CameraDevice[]): number {
    const rearPattern = /back|rear|environment|world/i;
    const rearIndex = cameras.findIndex(camera => rearPattern.test(camera.label || ''));
    return rearIndex >= 0 ? rearIndex : 0;
  }

  private detectTorchSupport(): void {
    try {
      this.torchSupported = !!this.scanner
        ?.getRunningTrackCameraCapabilities()
        .torchFeature()
        .isSupported();
    } catch {
      this.torchSupported = false;
    }
  }

  private isCameraContextAllowed(): boolean {
    const host = window.location.hostname;
    return window.isSecureContext || host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  }

  private cameraErrorKey(error: unknown): string {
    const value = `${(error as any)?.name || ''} ${(error as any)?.message || error || ''}`.toLowerCase();
    if (value.includes('notallowed') || value.includes('permission') || value.includes('denied')) return 'BARCODE.PERMISSION_DENIED';
    if (value.includes('notfound') || value.includes('no camera') || value.includes('devicesnotfound')) return 'BARCODE.NO_CAMERA';
    if (value.includes('notreadable') || value.includes('trackstart') || value.includes('in use') || value.includes('could not start video')) return 'BARCODE.CAMERA_IN_USE';
    if (value.includes('security') || value.includes('secure context') || value.includes('https')) return 'BARCODE.INSECURE_CONNECTION';
    return 'BARCODE.INITIALIZATION_FAILED';
  }

  private handleCameraError(key: string): void {
    this.errorKey = key;
    this.statusKey = '';
    this.alert.warning(key);
  }
}
