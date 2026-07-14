export type DashboardPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface DashboardSummary {
  totalProducts: number;
  totalStockValue: number;
  todaysSales: number;
  pendingPurchaseOrders: number;
  lowStockItems: number;
  activeWarehouses: number;
  trends?: Record<string, number>;
}

export interface SalesAnalytics {
  labels: string[];
  sales: number[];
  purchases: number[];
  totalSales: number;
  totalPurchases: number;
  salesTrend: number;
  purchaseTrend: number;
}

export interface StockMovementAnalytics {
  labels: string[];
  stockIn: number[];
  stockOut: number[];
  totalStockIn: number;
  totalStockOut: number;
}

export interface WarehouseStockValue {
  warehouseName: string;
  stockValue: number;
  percentage: number;
}

export interface ProfitOverview {
  totalProfit: number;
  grossProfit: number;
  netProfitMargin: number;
  averageOrderValue: number;
  labels: string[];
  profitData: number[];
  profitTrend: number;
}

export interface TopCustomer {
  customerName: string;
  customerCode?: string;
  photoUrl?: string;
  totalSales: number;
  trend: number;
}

export interface LowStockAlert {
  productName: string;
  imageUrl?: string;
  warehouseName: string;
  currentQuantity: number;
  reorderLevel: number;
}

export interface OutOfStockItem {
  productName: string;
  imageUrl?: string;
  status: string;
}

export interface RecentStockMovement {
  date: string;
  productName: string;
  imageUrl?: string;
  warehouseName: string;
  type: string;
  quantity: number;
  status: string;
}

export interface TopSellingProduct {
  productName: string;
  imageUrl?: string;
  unitsSold: number;
  revenue: number;
  trend: number;
}

export interface RecentPurchaseOrder {
  poNo: string;
  supplierName: string;
  date: string;
  amount: number;
  status: string;
}
