export interface ICustomer {
  customerId: number;
  customerCode: string;
  customerName: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'CORPORATE';
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  creditLimit: number;
  openingBalance: number;
  currentBalance: number;
  gstNumber: string;
  photoUrl?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Customer implements ICustomer {
  customerId: number = 0;
  customerCode: string = '';
  customerName: string = '';
  customerType: 'RETAIL' | 'WHOLESALE' | 'CORPORATE' = 'RETAIL';
  email: string = '';
  phone: string = '';
  mobile: string = '';
  address: string = '';
  city: string = '';
  state: string = '';
  postalCode: string = '';
  country: string = '';
  creditLimit: number = 0;
  openingBalance: number = 0;
  currentBalance: number = 0;
  gstNumber: string = '';
  photoUrl?: string = '';
  status: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
