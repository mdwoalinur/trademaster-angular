export interface ISaleItem {
  salesItemId: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
}

export class SaleItem implements ISaleItem {
  salesItemId: number = 0;
  saleId: number = 0;
  productId: number = 0;
  quantity: number = 0;
  unitPrice: number = 0;
  taxRate: number = 0;
  discountPercent: number = 0;
  discountAmount: number = 0;
  totalPrice: number = 0;
}