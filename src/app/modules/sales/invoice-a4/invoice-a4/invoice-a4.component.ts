import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-invoice-a4',
  templateUrl: './invoice-a4.component.html',
  styleUrls: ['./invoice-a4.component.css']
})
export class InvoiceA4Component {
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
  @Input() customerPhone: string = '';
  @Input() customerEmail: string = '';
  
  @Output() close = new EventEmitter<void>();

  printInvoice(): void {
    window.print();
  }

  onClose(): void {
    this.close.emit();
  }
}