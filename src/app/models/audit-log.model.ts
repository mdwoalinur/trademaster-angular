export interface AuditLog {
    logId?: number;
    userId: number;
    username: string;
    action: string;
    entityType?: string;
    entityId?: number;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: string;
}