import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DashboardPeriod,
  DashboardSummary,
  LowStockAlert,
  OutOfStockItem,
  ProfitOverview,
  RecentPurchaseOrder,
  RecentStockMovement,
  SalesAnalytics,
  StockMovementAnalytics,
  TopCustomer,
  TopSellingProduct,
  WarehouseStockValue
} from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`);
  }

  getSalesAnalytics(period: DashboardPeriod): Observable<SalesAnalytics> {
    return this.http.get<SalesAnalytics>(`${this.apiUrl}/sales-analytics?period=${period}`);
  }

  getStockMovement(period: DashboardPeriod = 'monthly'): Observable<StockMovementAnalytics> {
    return this.http.get<StockMovementAnalytics>(`${this.apiUrl}/stock-movement?period=${period}`);
  }

  getWarehouseStockValue(): Observable<WarehouseStockValue[]> {
    return this.http.get<WarehouseStockValue[]>(`${this.apiUrl}/warehouse-stock-value`);
  }

  getProfitOverview(period: DashboardPeriod = 'monthly'): Observable<ProfitOverview> {
    return this.http.get<ProfitOverview>(`${this.apiUrl}/profit-overview?period=${period}`);
  }

  getTopCustomers(limit = 5): Observable<TopCustomer[]> {
    return this.http.get<TopCustomer[]>(`${this.apiUrl}/top-customers?limit=${limit}`);
  }

  getLowStockAlerts(): Observable<LowStockAlert[]> {
    return this.http.get<LowStockAlert[]>(`${this.apiUrl}/low-stock-alerts`);
  }

  getOutOfStock(): Observable<OutOfStockItem[]> {
    return this.http.get<OutOfStockItem[]>(`${this.apiUrl}/out-of-stock`);
  }

  getRecentStockMovements(limit = 5): Observable<RecentStockMovement[]> {
    return this.http.get<RecentStockMovement[]>(`${this.apiUrl}/recent-stock-movements?limit=${limit}`);
  }

  getTopSellingProducts(limit = 5): Observable<TopSellingProduct[]> {
    return this.http.get<TopSellingProduct[]>(`${this.apiUrl}/top-selling-products?limit=${limit}`);
  }

  getRecentPurchaseOrders(limit = 5): Observable<RecentPurchaseOrder[]> {
    return this.http.get<RecentPurchaseOrder[]>(`${this.apiUrl}/recent-purchase-orders?limit=${limit}`);
  }
}
