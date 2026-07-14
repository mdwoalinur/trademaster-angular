

export interface Inventory {
  inventoryId: number;
  companyId: number;
  warehouseId: number;
  productId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: Date;
}