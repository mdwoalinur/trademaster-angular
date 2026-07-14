

export type AdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface StockAdjustment {
  adjustmentId: number;
  companyId: number;
  productId: number;
  warehouseId: number;
  systemQuantity: number;
  physicalQuantity: number;
  difference: number;
  reason: string;
  adjustmentDate: Date;
  approvedBy: number;
  status: AdjustmentStatus;
  notes: string;
  createdAt: Date;
}