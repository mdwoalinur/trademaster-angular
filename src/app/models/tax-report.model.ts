export interface TaxReport {
  salesTax?: number;
  purchaseTax?: number;
  netTax?: number;
  totalSalesAmount?: number;
  salesTaxOutput?: number;
  totalPurchaseAmount?: number;
  purchaseTaxInput?: number;
  netTaxPayable?: number;
  refundableAmount?: number;
  salesInvoiceCount?: number;
  purchaseInvoiceCount?: number;
  averageTaxRate?: number;
  salesTaxBreakdown?: SalesTaxBreakdown[];
  purchaseTaxBreakdown?: PurchaseTaxBreakdown[];
  taxSummaryByRate?: TaxSummaryByRate[];
  taxTrend?: TaxTrend[];
  insights?: string[];
}

export interface SalesTaxBreakdown {
  invoiceNo: string;
  saleDate: string;
  customerName: string;
  taxableAmount: number;
  taxRate: number;
  outputVat: number;
  totalAmount: number;
}

export interface PurchaseTaxBreakdown {
  purchaseOrderNo: string;
  purchaseDate: string;
  supplierName: string;
  taxableAmount: number;
  taxRate: number;
  inputVat: number;
  totalAmount: number;
}

export interface TaxSummaryByRate {
  taxRate: number;
  salesTaxableAmount: number;
  outputVat: number;
  purchaseTaxableAmount: number;
  inputVat: number;
  netVat: number;
}

export interface TaxTrend {
  label: string;
  outputVat: number;
  inputVat: number;
  netVat: number;
}
