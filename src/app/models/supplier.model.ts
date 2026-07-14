export interface ISupplier {
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentTerms: string;
  gstNumber: string;
  photoUrl?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Supplier implements ISupplier {
  supplierId: number = 0;
  supplierCode: string = '';
  supplierName: string = '';
  contactPerson: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  city: string = '';
  state: string = '';
  postalCode: string = '';
  country: string = '';
  paymentTerms: string = '';
  gstNumber: string = '';
  photoUrl?: string = '';
  status: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}
