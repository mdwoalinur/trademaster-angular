export interface ISale {
  saleId: number;
  invoiceNo: string;
  customerId: number;
  warehouseId: number;
  userId: number;
  saleDate: Date;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  notes: string;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}

export class Sale implements ISale {
  saleId: number = 0;
  invoiceNo: string = '';
  customerId: number = 0;
  warehouseId: number = 0;
  userId: number = 0;
  saleDate: Date = new Date();
  subtotal: number = 0;
  discountAmount: number = 0;
  taxAmount: number = 0;
  totalAmount: number = 0;
  paidAmount: number = 0;
  dueAmount: number = 0;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' = 'UNPAID';
  notes: string = '';
  status: 'COMPLETED' | 'CANCELLED' = 'COMPLETED';
  createdAt: Date = new Date();
}