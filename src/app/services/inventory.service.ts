import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;
  private movementUrl = `${environment.apiUrl}/stock-movements`;
  private adjustmentUrl = `${environment.apiUrl}/stock-adjustments`;
  private alertUrl = `${environment.apiUrl}/low-stock-alerts`;
  private wastageCategoryUrl = `${environment.apiUrl}/wastage-categories`;
  private wastageRecordUrl = `${environment.apiUrl}/wastage-records`;

  constructor(private http: HttpClient) {}

  // Inventory
  getInventory(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  getInventoryById(id: number): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${id}`); }
  updateInventory(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.apiUrl}/${id}`, data); }

  // Stock Movements
  getMovements(): Observable<any[]> { return this.http.get<any[]>(this.movementUrl); }

  // Stock Adjustments
  getAdjustments(): Observable<any[]> { return this.http.get<any[]>(this.adjustmentUrl); }
  createAdjustment(data: any): Observable<any> { return this.http.post<any>(this.adjustmentUrl, data); }
  updateAdjustment(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.adjustmentUrl}/${id}`, data); }
  approveAdjustment(id: number, approvedBy: number): Observable<any> { return this.http.put<any>(`${this.adjustmentUrl}/${id}/approve`, { approvedBy }); }
  rejectAdjustment(id: number, reason: string): Observable<any> { return this.http.put<any>(`${this.adjustmentUrl}/${id}/reject`, { reason }); }

  // Low Stock Alerts
  getAlerts(): Observable<any[]> { return this.http.get<any[]>(this.alertUrl); }
  generateAlerts(): Observable<void> { return this.http.post<void>(`${this.alertUrl}/generate`, { companyId: 1 }); }
  markAlertAsSent(id: number): Observable<void> { return this.http.put<void>(`${this.alertUrl}/${id}/mark-sent`, {}); }

  // Wastage Categories
  getWastageCategories(): Observable<any[]> { return this.http.get<any[]>(this.wastageCategoryUrl); }
  getWastageCategoryById(id: number): Observable<any> { return this.http.get<any>(`${this.wastageCategoryUrl}/${id}`); }
  createWastageCategory(data: any): Observable<any> { return this.http.post<any>(this.wastageCategoryUrl, data); }
  updateWastageCategory(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.wastageCategoryUrl}/${id}`, data); }
  deleteWastageCategory(id: number): Observable<void> { return this.http.delete<void>(`${this.wastageCategoryUrl}/${id}`); }

  // Wastage Records
  getWastageRecords(): Observable<any[]> { return this.http.get<any[]>(this.wastageRecordUrl); }
  getWastageRecordById(id: number): Observable<any> { return this.http.get<any>(`${this.wastageRecordUrl}/${id}`); }
  createWastageRecord(data: any): Observable<any> { return this.http.post<any>(this.wastageRecordUrl, data); }
  updateWastageRecord(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.wastageRecordUrl}/${id}`, data); }
  deleteWastageRecord(id: number): Observable<void> { return this.http.delete<void>(`${this.wastageRecordUrl}/${id}`); }
  approveWastageRecord(id: number, approvedBy: number): Observable<any> { return this.http.put<any>(`${this.wastageRecordUrl}/${id}/approve`, { approvedBy }); }
}