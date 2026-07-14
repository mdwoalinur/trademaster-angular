

export type WastageType = 'PRODUCTION' | 'STORAGE' | 'HANDLING' | 'EXPIRED' | 'DAMAGED' | 'RETURN' | 'OTHER';
export type WastageApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WastageRecord {
  wastageId: number;
  companyId: number;
  productId: number;
  warehouseId: number;
  wastageType: WastageType;
  quantity: number;
  unitId: number;
  wastageDate: Date;
  reason: string;
  batchNo: string;
  manufacturingDate: Date;
  expiryDate: Date;
  financialLoss: number;
  recoveryAmount: number;
  notes: string;
  responsiblePerson: number;
  approvedBy: number;
  status: WastageApprovalStatus;
}