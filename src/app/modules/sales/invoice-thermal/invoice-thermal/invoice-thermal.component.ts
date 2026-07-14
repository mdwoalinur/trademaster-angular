import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-invoice-thermal',
  templateUrl: './invoice-thermal.component.html',
  styleUrls: ['./invoice-thermal.component.css']
})
export class InvoiceThermalComponent {
  @Input() sale: any;
  @Input() cart: any[] = [];
  @Input() subtotal: number = 0;
  @Input() discountPercent: number = 0;
  @Input() discountAmount: number = 0;
  @Input() taxRate: number = 0;
  @Input() taxAmount: number = 0;
  @Input() total: number = 0;
  @Input() paidAmount: number = 0;
  @Input() change: number = 0;
  @Input() paymentMethod: string = 'CASH';
  @Input() customerName: string = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();

  printReceipt(): void {
    this.print.emit();
    setTimeout(() => window.print(), 100);
  }

  onClose(): void {
    this.close.emit();
  }
}