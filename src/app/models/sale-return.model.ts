export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type ReturnType = 'FULL' | 'PARTIAL';

export interface SaleReturn {
    returnId?: number;
    saleId: number;
    returnNo?: string;
    returnDate?: string;
    customerId: number;
    warehouseId: number;
    totalReturnAmount: number;
    refundAmount?: number;
    exchangeAmount?: number;
    reason?: string;
    returnType: ReturnType;
    status: ReturnStatus;
    approvedBy?: number;
    notes?: string;
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
}