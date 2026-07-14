export type FinancialAccountType = 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'CARD_CLEARING' | 'OTHER';
export type FinancialAccountStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface FinancialAccount {
  accountId?: number;
  accountCode: string;
  accountName: string;
  accountType: FinancialAccountType;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  mobileProvider?: string;
  currencyCode?: string;
  openingBalance?: number;
  currentBalance?: number;
  allowOverdraft?: boolean;
  status?: FinancialAccountStatus;
  companyId?: number;
  warehouseId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountLedgerEntry {
  entryId?: number;
  accountId: number;
  paymentId?: number;
  entryType: string;
  direction: string;
  debitAmount?: number;
  creditAmount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceType?: string;
  referenceId?: number;
  voucherNo?: string;
  description?: string;
  postedAt?: string;
}
