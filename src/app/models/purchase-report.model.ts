
export interface PurchaseReport {
  totalCount: number;
  totalAmount: number;
  purchases: PurchaseItem[];
  supplierSummary: SupplierSummary[];
}

export interface PurchaseItem {
  purchaseId: number;
  purchaseOrderNo: string;
  supplierId: number;
  supplierName: string;
  purchaseDate: string;
  totalAmount: number;
  status: string;
}

export interface SupplierSummary {
  supplierName: string;
  totalAmount: number;
}