export interface User {
    userId?: number;
    roleId: number;
    username: string;
    passwordHash?: string;
    fullName: string;
    email: string;
    phone: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt?: string;
    updatedAt?: string;
}