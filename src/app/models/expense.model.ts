
import { ExpenseItem } from './expense-item.model';


export interface ExpenseAttachment {
  attachmentId?: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
}

// ---------- Expense Interface ----------
export interface Expense {
  expenseId?: number;
  expenseNo: string;
  expenseDate: string;
  vendorId?: number | null;
  vendorName?: string;
  vendor?: any;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  paymentMethod: 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'CHEQUE';
  referenceNo?: string;
  notes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  items: ExpenseItem[];
  attachments?: ExpenseAttachment[];
}

// ---------- Expense Class (implements Expense) ----------
export class Expense implements Expense {
  expenseId?: number;
  expenseNo: string = '';
  expenseDate: string = new Date().toISOString().split('T')[0];
  vendorId?: number | null = null;
  vendorName?: string = '';
  vendor?: any = undefined;
  totalAmount: number = 0;
  discountAmount: number = 0;
  taxAmount: number = 0;
  grandTotal: number = 0;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' = 'UNPAID';
  paymentMethod: 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'CHEQUE' = 'CASH';
  referenceNo?: string = '';
  notes?: string = '';
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' = 'DRAFT';
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  items: ExpenseItem[] = [];
  attachments?: ExpenseAttachment[] = [];
}