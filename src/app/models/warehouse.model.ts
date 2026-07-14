export interface Warehouse {
  id?: number;
  warehouseCode: string;
  name: string;              
  location?: string;
  status: string;             
  capacity?: number;
  managerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}