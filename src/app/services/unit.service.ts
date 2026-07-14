import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Unit } from '../models/unit.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UnitService {
  private apiUrl = `${environment.apiUrl}/units`;

  constructor(private http: HttpClient) {}

  getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.apiUrl);
  }

  getUnitById(id: number): Observable<Unit> {
    return this.http.get<Unit>(`${this.apiUrl}/${id}`);
  }

  createUnit(unit: Unit): Observable<Unit> {
    const { unitId, ...newUnit } = unit;
    return this.http.post<Unit>(this.apiUrl, newUnit);
  }

  updateUnit(id: number, unit: Unit): Observable<Unit> {
    return this.http.put<Unit>(`${this.apiUrl}/${id}`, unit);
  }

  deleteUnit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}