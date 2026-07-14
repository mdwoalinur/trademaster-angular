export interface IUnit {
  unitId: number;
  unitName: string;
  unitCode: string;
  unitType: 'WEIGHT' | 'LENGTH' | 'VOLUME' | 'PIECE' | 'TIME' | 'OTHER';
  baseUnitId: number | null;
  conversionFactor: number;
  isBase: boolean;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Unit implements IUnit {
  unitId: number = 0;
  unitName: string = '';
  unitCode: string = '';
  unitType: 'WEIGHT' | 'LENGTH' | 'VOLUME' | 'PIECE' | 'TIME' | 'OTHER' = 'PIECE';
  baseUnitId: number | null = null;
  conversionFactor: number = 1;
  isBase: boolean = false;
  status: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}