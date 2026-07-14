export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export class Product {
  id?: number;
  categoryId: number = 0;
  productCode: string = '';
  sku: string = '';
  productName: string = '';
  description: string = '';
  imageUrl?: string = '';
  baseUnitId: number | null = null;
  buyingPrice: number = 0;
  sellingPrice: number = 0;
  taxRate: number = 0;
  minStockLevel: number = 0;
  maxStockLevel: number = 0;
  reorderLevel: number = 0;
  selectUnit: string = 'Piece';
  status: ProductStatus = 'ACTIVE';
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
