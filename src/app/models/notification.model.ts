export interface Notification {
    notificationId?: number;
    id?: number;
    type: 'LOW_STOCK' | 'DUE_PAYMENT' | 'PAYMENT' | 'SALE' | 'PURCHASE' | 'PURCHASE_RETURN' | 'WASTAGE' | 'SYSTEM' | 'OTHER';
    priority?: 'LOW' | 'NORMAL' | 'MEDIUM' | 'HIGH';
    title: string;
    message: string;
    referenceId?: number;
    referenceType?: string;
    route?: string;
    actionUrl?: string;
    icon?: string;
    color?: string;
    timeAgo?: string;
    read?: boolean;
    isRead: boolean;
    createdAt?: Date;
    readAt?: Date;
}
