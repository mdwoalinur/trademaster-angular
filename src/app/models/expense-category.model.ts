export interface IExpenseCategory {
  expCategoryId: number;
  categoryName: string;
  categoryCode: string;
  parentCategoryId: number | null;
  description: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ExpenseCategory implements IExpenseCategory {
  expCategoryId: number = 0;
  categoryName: string = '';
  categoryCode: string = '';
  parentCategoryId: number | null = null;
  description: string = '';
  status: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}