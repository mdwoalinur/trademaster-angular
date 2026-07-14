export interface PurchaseItem {
  purchaseItemId?: number;     
  productId: number;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  notes?: string;
  subtotal?: number;
}

export interface Purchase {
  purchaseId?: number;          
  purchaseOrderNo: string;
  supplierId: number;
  warehouseId?: number;
  userId?: number; 
  purchaseDate: Date | string;
  expectedDelivery?: Date | string;
  actualDelivery?: Date | string;
  paymentTerms?: string;
  notes?: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  items: PurchaseItem[];
}
