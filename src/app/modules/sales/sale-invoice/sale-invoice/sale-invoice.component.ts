import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-sale-invoice',
  templateUrl: './sale-invoice.component.html',
  styleUrls: ['./sale-invoice.component.css'],
  encapsulation: ViewEncapsulation.None   
})
export class SaleInvoiceComponent {
  @Input() sale: any;                     
  @Input() items: any[] = [];            
  @Input() customerName: string = '';
  @Input() customerPhotoUrl: string = '';
  @Input() customerPhone: string = '';
  @Input() customerEmail: string = '';
  @Input() warehouseName: string = '';
  
  @Output() close = new EventEmitter<void>();

  printInvoice(): void {
  setTimeout(() => {
    window.print();
  }, 200);
}

  onClose(): void {
    this.close.emit();
  }

  // Helper methods for display
  getPaymentMethodLabel(method: string): string {
    switch(method) {
      case 'CASH': return '💵 Cash';
      case 'BANK': return '🏦 Bank Transfer';
      case 'MOBILE_BANKING': return '📱 Mobile Banking';
      default: return method;
    }
  }

  
}
