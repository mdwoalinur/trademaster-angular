export type PurchaseReturnStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface PurchaseReturnItem {
  id?: number;
  purchaseReturnId?: number;
  productId: number;
  purchaseItemId: number;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount?: number;
  discountAmount: number;
  totalAmount?: number;
  reason?: string;
  productName?: string;
  sku?: string;
  imageUrl?: string;
}

export interface PurchaseReturn {
  id?: number;
  returnNo?: string;
  originalPurchaseId: number;
  originalPurchaseNo?: string;
  supplierId?: number;
  supplierName?: string;
  warehouseId?: number;
  warehouseName?: string;
  returnDate: string;
  reason: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  status?: PurchaseReturnStatus;
  notes?: string;
  items: PurchaseReturnItem[];
  stockMovements?: any[];
}

export interface ReturnablePurchaseItem {
  purchaseItemId: number;
  productId: number;
  productName: string;
  sku?: string;
  imageUrl?: string;
  purchasedQuantity: number;
  alreadyReturnedQuantity: number;
  returnableQuantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  returnQuantity?: number;
  reason?: string;
}
