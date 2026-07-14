import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DashboardService } from 'src/app/services/dashboard.service';
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
} from 'src/app/models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: DashboardSummary = {
    totalProducts: 0,
    totalStockValue: 0,
    todaysSales: 0,
    pendingPurchaseOrders: 0,
    lowStockItems: 0,
    activeWarehouses: 0,
    trends: {}
  };

  salesAnalytics: SalesAnalytics = this.emptySalesAnalytics();
  stockMovement: StockMovementAnalytics = this.emptyStockMovement();
  warehouseStockValue: WarehouseStockValue[] = [];
  profitOverview: ProfitOverview = this.emptyProfitOverview();
  topCustomers: TopCustomer[] = [];
  lowStockAlerts: LowStockAlert[] = [];
  outOfStockItems: OutOfStockItem[] = [];
  recentStockMovements: RecentStockMovement[] = [];
  topSellingProducts: TopSellingProduct[] = [];
  recentPurchaseOrders: RecentPurchaseOrder[] = [];

  selectedSalesPeriod: DashboardPeriod = 'monthly';
  loading = true;
  panelLoading: Record<string, boolean> = {};
  errors: string[] = [];

  private salesChart?: Chart;
  private stockChart?: Chart;
  private warehouseChart?: Chart;
  private profitChart?: Chart;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errors = [];
    this.loadSummary();
    this.loadSalesAnalytics(this.selectedSalesPeriod);
    this.loadStockMovement();
    this.loadWarehouseStockValue();
    this.loadProfitOverview();
    this.loadTopCustomers();
    this.loadLowStockAlerts();
    this.loadOutOfStock();
    this.loadRecentStockMovements();
    this.loadTopSellingProducts();
    this.loadRecentPurchaseOrders();
    setTimeout(() => this.loading = false, 500);
  }

  loadSummary(): void {
    this.setLoading('summary', true);
    this.dashboardService.getSummary().subscribe({
      next: data => {
        this.summary = { ...this.summary, ...(data || {}) };
        this.setLoading('summary', false);
      },
      error: () => this.markError('summary', 'Failed to load dashboard summary')
    });
  }

  loadSalesAnalytics(period: DashboardPeriod): void {
    this.selectedSalesPeriod = period;
    this.setLoading('sales', true);
    this.dashboardService.getSalesAnalytics(period).subscribe({
      next: data => {
        this.salesAnalytics = { ...this.emptySalesAnalytics(), ...(data || {}) };
        this.renderSalesChart();
        this.setLoading('sales', false);
      },
      error: () => this.markError('sales', 'Failed to load sales analytics')
    });
  }

  loadStockMovement(): void {
    this.setLoading('stock', true);
    this.dashboardService.getStockMovement('monthly').subscribe({
      next: data => {
        this.stockMovement = { ...this.emptyStockMovement(), ...(data || {}) };
        this.renderStockChart();
        this.setLoading('stock', false);
      },
      error: () => this.markError('stock', 'Failed to load stock movement')
    });
  }

  loadWarehouseStockValue(): void {
    this.setLoading('warehouse', true);
    this.dashboardService.getWarehouseStockValue().subscribe({
      next: data => {
        this.warehouseStockValue = Array.isArray(data) ? data : [];
        this.renderWarehouseChart();
        this.setLoading('warehouse', false);
      },
      error: () => this.markError('warehouse', 'Failed to load warehouse stock value')
    });
  }

  loadProfitOverview(): void {
    this.setLoading('profit', true);
    this.dashboardService.getProfitOverview('monthly').subscribe({
      next: data => {
        this.profitOverview = { ...this.emptyProfitOverview(), ...(data || {}) };
        this.renderProfitChart();
        this.setLoading('profit', false);
      },
      error: () => this.markError('profit', 'Failed to load profit overview')
    });
  }

  loadTopCustomers(): void {
    this.dashboardService.getTopCustomers(5).subscribe({
      next: data => this.topCustomers = Array.isArray(data) ? data : [],
      error: () => this.markError('customers', 'Failed to load top customers')
    });
  }

  loadLowStockAlerts(): void {
    this.dashboardService.getLowStockAlerts().subscribe({
      next: data => this.lowStockAlerts = Array.isArray(data) ? data : [],
      error: () => this.markError('lowStock', 'Failed to load low stock alerts')
    });
  }

  loadOutOfStock(): void {
    this.dashboardService.getOutOfStock().subscribe({
      next: data => this.outOfStockItems = Array.isArray(data) ? data : [],
      error: () => this.markError('outOfStock', 'Failed to load out of stock items')
    });
  }

  loadRecentStockMovements(): void {
    this.dashboardService.getRecentStockMovements(5).subscribe({
      next: data => this.recentStockMovements = Array.isArray(data) ? data : [],
      error: () => this.markError('movements', 'Failed to load recent stock movements')
    });
  }

  loadTopSellingProducts(): void {
    this.dashboardService.getTopSellingProducts(5).subscribe({
      next: data => this.topSellingProducts = Array.isArray(data) ? data : [],
      error: () => this.markError('products', 'Failed to load top selling products')
    });
  }

  loadRecentPurchaseOrders(): void {
    this.dashboardService.getRecentPurchaseOrders(5).subscribe({
      next: data => this.recentPurchaseOrders = Array.isArray(data) ? data : [],
      error: () => this.markError('purchases', 'Failed to load recent purchase orders')
    });
  }

  renderSalesChart(): void {
    const ctx = document.getElementById('salesAnalyticsChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.salesChart) this.salesChart.destroy();
    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.salesAnalytics.labels || [],
        datasets: [
          this.lineDataset('Sales (BDT)', this.salesAnalytics.sales || [], '#1463ff', 'rgba(20, 99, 255, 0.12)'),
          this.lineDataset('Purchases (BDT)', this.salesAnalytics.purchases || [], '#16a34a', 'rgba(22, 163, 74, 0.10)')
        ]
      },
      options: this.chartOptions()
    });
  }

  renderStockChart(): void {
    const ctx = document.getElementById('stockMovementChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.stockChart) this.stockChart.destroy();
    this.stockChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.stockMovement.labels || [],
        datasets: [
          { label: 'Stock In', data: this.stockMovement.stockIn || [], backgroundColor: '#1463ff', borderRadius: 6 },
          { label: 'Stock Out', data: this.stockMovement.stockOut || [], backgroundColor: '#ff3b3b', borderRadius: 6 }
        ]
      },
      options: this.chartOptions()
    });
  }

  renderWarehouseChart(): void {
    const ctx = document.getElementById('warehouseStockChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.warehouseChart) this.warehouseChart.destroy();
    this.warehouseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.warehouseStockValue.map(item => item.warehouseName || 'N/A'),
        datasets: [{
          data: this.warehouseStockValue.map(item => Number(item.stockValue || 0)),
          backgroundColor: ['#1463ff', '#22c55e', '#f59e0b', '#7c3aed', '#06b6d4', '#94a3b8'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: { legend: { display: false } }
      }
    });
  }

  renderProfitChart(): void {
    const ctx = document.getElementById('profitOverviewChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.profitChart) this.profitChart.destroy();
    this.profitChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.profitOverview.labels || [],
        datasets: [this.lineDataset('Profit (BDT)', this.profitOverview.profitData || [], '#7c3aed', 'rgba(124, 58, 237, 0.12)')]
      },
      options: this.chartOptions(false)
    });
  }

  kpis() {
    const trends = this.summary.trends || {};
    return [
      { title: 'Total Products', value: this.summary.totalProducts, icon: 'bi-box-seam', trend: trends['productsTrend'], className: 'blue', currency: false },
      { title: 'Total Stock Value', value: this.summary.totalStockValue, icon: 'bi-currency-dollar', trend: trends['stockValueTrend'], className: 'green', currency: true },
      { title: "Today's Sales", value: this.summary.todaysSales, icon: 'bi-cart-check', trend: trends['salesTrend'], className: 'purple', currency: true },
      { title: 'Pending POs', value: this.summary.pendingPurchaseOrders, icon: 'bi-clipboard-data', trend: trends['pendingPoTrend'], className: 'orange', currency: false },
      { title: 'Low Stock Items', value: this.summary.lowStockItems, icon: 'bi-exclamation-triangle', trend: trends['lowStockTrend'], className: 'red', currency: false },
      { title: 'Active Warehouses', value: this.summary.activeWarehouses, icon: 'bi-houses', trend: trends['warehouseTrend'], className: 'cyan', currency: false }
    ];
  }

  totalWarehouseValue(): number {
    return this.warehouseStockValue.reduce((sum, item) => sum + Number(item.stockValue || 0), 0);
  }

  formatTrend(value: any): string {
    const numeric = Number(value || 0);
    if (numeric === 0) return 'No change';
    return `${numeric > 0 ? '+' : ''}${numeric.toFixed(1)}%`;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private setLoading(key: string, value: boolean): void {
    this.panelLoading[key] = value;
  }

  private markError(key: string, message: string): void {
    this.setLoading(key, false);
    if (!this.errors.includes(message)) this.errors.push(message);
  }

  private lineDataset(label: string, data: number[], borderColor: string, backgroundColor: string) {
    return {
      label,
      data,
      borderColor,
      backgroundColor,
      tension: 0.38,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: borderColor
    };
  }

  private chartOptions(showLegend = true): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: showLegend, labels: { usePointStyle: true, boxWidth: 8 } }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    };
  }

  private destroyCharts(): void {
    [this.salesChart, this.stockChart, this.warehouseChart, this.profitChart].forEach(chart => chart?.destroy());
  }

  private emptySalesAnalytics(): SalesAnalytics {
    return { labels: [], sales: [], purchases: [], totalSales: 0, totalPurchases: 0, salesTrend: 0, purchaseTrend: 0 };
  }

  private emptyStockMovement(): StockMovementAnalytics {
    return { labels: [], stockIn: [], stockOut: [], totalStockIn: 0, totalStockOut: 0 };
  }

  private emptyProfitOverview(): ProfitOverview {
    return { totalProfit: 0, grossProfit: 0, netProfitMargin: 0, averageOrderValue: 0, labels: [], profitData: [], profitTrend: 0 };
  }
}
