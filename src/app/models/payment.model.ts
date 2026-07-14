
export interface PaymentAllocationInput {
  allocationId?: number;
  referenceType: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'SALES_RETURN' | 'PURCHASE_RETURN' | 'REFUND' | 'ADVANCE';
  referenceId: number;
  allocatedAmount: number;
  discountAmount?: number;
  writeOffAmount?: number;
  referenceNo?: string;
  dueAmount?: number;
}

export interface Payment {
  paymentId?: number;
  voucherNo?: string;
  direction?: 'RECEIVE' | 'PAY' | 'REFUND' | 'TRANSFER';
  paymentType: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'POS' | 'CUSTOMER_ADVANCE' | 'SUPPLIER_ADVANCE' | 'REFUND' | 'ADJUSTMENT' | 'ACCOUNT_TRANSFER';
  partyType?: 'CUSTOMER' | 'SUPPLIER' | 'VENDOR' | 'EMPLOYEE' | 'INTERNAL' | 'OTHER';
  partyId?: number;
  referenceId?: number;
  paymentDate: Date | string;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED';
  amount: number;
  requestedAmount?: number;
  approvedAmount?: number;
  currencyCode?: string;
  accountId?: number;
  destinationAccountId?: number;
  paymentMethod: 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'CHEQUE' | 'BANK_TRANSFER' | 'CARD';
  transactionReference?: string;
  referenceNo?: string;
  notes?: string;
  approvalStatus?: 'DRAFT' | 'PENDING_APPROVAL' | 'RETURNED_FOR_CORRECTION' | 'APPROVED' | 'REJECTED';
  transactionStatus?: 'PENDING' | 'POSTED' | 'FAILED' | 'CANCELLED' | 'VOIDED' | 'REVERSED';
  reconciliationStatus?: 'UNRECONCILED' | 'RECONCILED' | 'MISMATCH';
  originalPaymentId?: number;
  reversalPaymentId?: number;
  refundReason?: string;
  cashDrawer?: string;
  receivedAmount?: number;
  changeAmount?: number;
  transferDate?: Date | string;
  senderReceiverReference?: string;
  chequeDate?: Date | string;
  expectedClearingDate?: Date | string;
  chequeStatus?: string;
  bankName?: string;
  chequeNumber?: string;
  mobileProvider?: string;
  mobileTransactionId?: string;
  cardType?: string;
  cardLastFour?: string;
  gatewayReference?: string;
  approvalCode?: string;
  terminalReference?: string;
  receivedBy?: number;
  createdAt?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  postedAt?: Date;
  allocations?: PaymentAllocationInput[];
}

export class Payment implements Payment {
  direction?: 'RECEIVE' | 'PAY' | 'REFUND' | 'TRANSFER' = 'RECEIVE';
  paymentType: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'POS' | 'CUSTOMER_ADVANCE' | 'SUPPLIER_ADVANCE' | 'REFUND' | 'ADJUSTMENT' | 'ACCOUNT_TRANSFER' = 'SALE';
  referenceId?: number;
  paymentDate: Date | string = new Date().toISOString().slice(0, 16); 
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED' = 'UNPAID';
  amount = 0;
  requestedAmount?: number = 0;
  accountId?: number;
  destinationAccountId?: number;
  paymentMethod: 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'CHEQUE' | 'BANK_TRANSFER' | 'CARD' = 'CASH';
  approvalStatus?: 'DRAFT' | 'PENDING_APPROVAL' | 'RETURNED_FOR_CORRECTION' | 'APPROVED' | 'REJECTED' = 'DRAFT';
  transactionStatus?: 'PENDING' | 'POSTED' | 'FAILED' | 'CANCELLED' | 'VOIDED' | 'REVERSED' = 'PENDING';
  reconciliationStatus?: 'UNRECONCILED' | 'RECONCILED' | 'MISMATCH' = 'UNRECONCILED';
  referenceNo?: string;
  notes?: string;
  receivedBy?: number;
  createdAt?: Date; 
  allocations?: PaymentAllocationInput[] = [];
}
