export type PaymentMethod = 'CASH' | 'BANK' | 'MOBILE_BANKING';

export interface IDueCollection {
  collectionId: number;
  saleId: number;
  collectionDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  notes: string;
  collectedBy: number;
  createdAt: Date;
}

export class DueCollection implements IDueCollection {
  collectionId: number = 0;
  saleId: number = 0;
  collectionDate: Date = new Date();
  amount: number = 0;
  paymentMethod: PaymentMethod = 'CASH';
  notes: string = '';
  collectedBy: number = 0;
  createdAt: Date = new Date();
}