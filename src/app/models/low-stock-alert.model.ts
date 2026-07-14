

export interface LowStockAlert {
  alertId: number;
  companyId: number;
  productId: number;
  warehouseId: number;
  reorderLevel: number;
  currentQuantity: number;
  alertSent: boolean;
  sentAt: Date;
}