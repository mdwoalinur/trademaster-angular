export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface StockTransfer {
    transferId?: number;
    transferNo?: string;
    fromWarehouseId: number;
    toWarehouseId: number;
    transferDate?: string;
    status: TransferStatus;
    reason?: string;
    notes?: string;
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
    approvedBy?: number;
    approvedAt?: string;
    items: StockTransferItem[];
}

export interface StockTransferItem {
    transferItemId?: number;
    productId: number;
    quantity: number;
}