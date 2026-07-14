

export interface ExpenseItem {
  expenseItemId?: number;
  expCategoryId?: number | null;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount?: number;
  taxRate: number;
  taxAmount?: number;
  totalPrice?: number;
  notes?: string;
  categoryName?: string;
  categoryCode?: string;
}

export class ExpenseItem implements ExpenseItem {
  expenseItemId?: number;
  expCategoryId?: number | null = null;
  itemName: string = '';
  description?: string = '';
  quantity: number = 1;
  unitPrice: number = 0;
  discountPercent: number = 0;
  discountAmount?: number = 0;
  taxRate: number = 0;
  taxAmount?: number = 0;
  totalPrice?: number = 0;
  notes?: string = '';
  categoryName?: string = '';
  categoryCode?: string = '';
}