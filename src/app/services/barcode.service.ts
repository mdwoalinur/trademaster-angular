import { Injectable } from '@angular/core';
import JsBarcode from 'jsbarcode';       // now works with the flags above

@Injectable({ providedIn: 'root' })
export class BarcodeService {

  generateBarcode(canvasId: string, code: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      JsBarcode(canvas, code, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 60,
        displayValue: true
      });
    }
  }

  getBarcodeDataURL(code: string): string {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, code, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: true
    });
    return canvas.toDataURL('image/png');
  }
}