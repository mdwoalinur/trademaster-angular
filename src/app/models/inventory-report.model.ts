
export interface InventoryReport {
  totalProducts: number;
  totalStockQuantity: number;
  totalInventoryValue: number;
  lowStockItems: LowStockItem[];
  allItems: InventoryItem[];
}

export interface LowStockItem {
  productId: number;
  productName: string;
  sku: string;
  imageUrl?: string;
  productImageUrl?: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
}

export interface InventoryItem {
  productId: number;
  productName: string;
  sku: string;
  imageUrl?: string;
  productImageUrl?: string;
  categoryId: number;
  unitType: string;
  currentStock: number;
  unitPrice: number;
  totalValue: number;
  reorderLevel: number;
  status: 'LOW' | 'NORMAL';
}
