import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, take } from 'rxjs/operators';
import { Product } from 'src/app/models/product.model';
import { BarcodeScannerComponent } from 'src/app/modules/barcode-scanner/barcode-scanner/barcode-scanner.component';
import { ProductService } from './product.service';

export interface ScannedProductResult {
  code: string;
  product: Product;
}

export interface ScannedProductError {
  code: string;
  cause: unknown;
}

@Injectable({ providedIn: 'root' })
export class BarcodeLookupService {
  private activeDialog: MatDialogRef<BarcodeScannerComponent> | null = null;

  constructor(
    private dialog: MatDialog,
    private productService: ProductService
  ) {}

  scanProduct(): Observable<ScannedProductResult> {
    if (this.activeDialog) return EMPTY;

    const dialogRef = this.dialog.open(BarcodeScannerComponent, {
      width: 'calc(100vw - 24px)',
      maxWidth: '620px',
      maxHeight: 'calc(100dvh - 24px)',
      panelClass: 'tm-barcode-dialog',
      autoFocus: false,
      restoreFocus: true
    });
    this.activeDialog = dialogRef;

    return dialogRef.afterClosed().pipe(
      map(value => String(value || '').trim()),
      filter(code => !!code),
      take(1),
      switchMap(code => this.productService.getProductByScannedCode(code).pipe(
        map(product => ({ code, product })),
        catchError(cause => throwError((): ScannedProductError => ({ code, cause })))
      )),
      finalize(() => {
        if (this.activeDialog === dialogRef) this.activeDialog = null;
      })
    );
  }

  isNotFound(error: unknown): boolean {
    const cause = (error as ScannedProductError)?.cause as any;
    return cause?.status === 404;
  }
}
