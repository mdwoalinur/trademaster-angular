

export type MovementType = 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';

export interface StockMovement {
  movementId: number;
  companyId: number;
  productId: number;
  warehouseId: number;
  movementType: MovementType;
  referenceId: number;
  referenceNo: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string;
  createdBy: number;
  createdAt: Date;
}