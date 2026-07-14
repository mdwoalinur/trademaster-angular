export type ItemCondition = 'GOOD' | 'DAMAGED' | 'EXPIRED';
export type ActionTaken = 'REFUND' | 'EXCHANGE' | 'STORE_CREDIT';

export interface SaleReturnItem {
    returnItemId?: number;
    returnId?: number;
    salesItemId?: number;
    productId: number;
    returnedQuantity: number;
    unitPrice: number;
    refundAmount?: number;
    reason?: string;
    itemCondition?: ItemCondition;
    actionTaken?: ActionTaken;
    createdAt?: string;
}