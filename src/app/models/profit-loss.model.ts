
export interface ProfitLoss {
  revenue: number;
  expenses: number;
  netProfit: number;
  totalRevenue?: number;
  costOfGoodsSold?: number;
  totalPurchaseCost?: number;
  grossProfit?: number;
  totalExpenses?: number;
  grossProfitMargin?: number;
  netProfitMargin?: number;
  salesCount?: number;
  purchaseCount?: number;
  expenseCount?: number;
  revenueBreakdown?: RevenueBreakdown[];
  purchaseBreakdown?: PurchaseBreakdown[];
  expenseBreakdown?: ExpenseBreakdown[];
  profitTrend?: ProfitTrend[];
  insights?: string[];
}

export interface RevenueBreakdown {
  source: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface PurchaseBreakdown {
  type: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface ExpenseBreakdown {
  categoryName: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface ProfitTrend {
  label: string;
  revenue: number;
  expenses: number;
  netProfit: number;
}
