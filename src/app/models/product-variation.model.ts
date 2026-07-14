export interface IProductVariation {
  variationId: number;
  productId: number;
  variationName: string;
  sku: string;
  buyingPrice: number;
  additionalPrice: number;
  imageUrl?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductVariation implements IProductVariation {
  variationId: number = 0;
  productId: number = 0;
  variationName: string = '';
  sku: string = '';
  buyingPrice: number = 0;
  additionalPrice: number = 0;
  imageUrl?: string = '';
  status: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
