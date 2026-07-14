export interface ICategory {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  description: string;
  status: boolean;
  createdAt: Date;
}

export class Category implements ICategory {
  categoryId: number = 0;
  categoryName: string = '';
  parentCategoryId: number | null = null;
  description: string = '';
  status: boolean = true;
  createdAt: Date = new Date();
}