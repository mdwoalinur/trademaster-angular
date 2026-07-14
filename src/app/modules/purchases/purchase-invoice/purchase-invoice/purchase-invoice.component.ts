import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  styleUrls: ['./purchase-invoice.component.css']
})
export class PurchaseInvoiceComponent {
  @Input() purchase: any;
  @Input() supplierName: string = '';
  @Input() warehouseName: string = '';
  
  @Output() close = new EventEmitter<void>();

  print(): void {
    window.print();
  }

  onClose(): void {
    this.close.emit();
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'PENDING': return 'Pending';
      case 'RECEIVED': return 'Received';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  //  Get CSS class for status badge
  getStatusClass(status: string): string {
    switch(status) {
      case 'PENDING': return 'status-badge PENDING';
      case 'RECEIVED': return 'status-badge RECEIVED';
      case 'CANCELLED': return 'status-badge CANCELLED';
      default: return 'status-badge';
    }
  }
}