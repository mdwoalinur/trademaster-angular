import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ProfitLossService } from 'src/app/services/profit-loss.service';
import { ProfitLoss } from 'src/app/models/profit-loss.model';

type QuickFilter = 'today' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.css']
})
export class ProfitLossComponent implements OnInit, OnDestroy {
  startDate: string;
  endDate: string;
  profitLoss: ProfitLoss | null = null;
  loading = false;
  error = '';
  generatedAt = new Date();

  private summaryChart?: Chart;
  private trendChart?: Chart;
  private expenseChart?: Chart;

  constructor(private profitLossService: ProfitLossService) {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    this.endDate = now.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.loadReport();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadReport(): void {
    this.loading = true;
    this.error = '';
    this.profitLossService.getProfitLoss(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.profitLoss = data;
        this.generatedAt = new Date();
        this.loading = false;
        setTimeout(() => this.renderCharts());
      },
      error: (err) => {
        this.error = 'Failed to load report';
        this.loading = false;
        console.error(err);
      }
    });
  }

  resetFilters(): void {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    this.endDate = now.toISOString().slice(0, 10);
    this.loadReport();
  }

  applyQuickFilter(filter: QuickFilter): void {
    const now = new Date();
    let start = new Date(now);
    if (filter === 'today') {
      start = new Date(now);
    } else if (filter === 'week') {
      const day = now.getDay() || 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
    } else if (filter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    this.startDate = this.toDateInput(start);
    this.endDate = this.toDateInput(now);
    this.loadReport();
  }

  printReport(): void {
    window.print();
  }

  exportCsv(): void {
    if (!this.profitLoss) return;

    const revenueBreakdown = this.profitLoss.revenueBreakdown || [];
    const expenseBreakdown = this.profitLoss.expenseBreakdown || [];
    const purchaseBreakdown = this.profitLoss.purchaseBreakdown || [];
    const hasData = this.totalRevenue() !== 0
      || this.costOfGoodsSold() !== 0
      || this.totalExpenses() !== 0
      || revenueBreakdown.length > 0
      || expenseBreakdown.length > 0
      || purchaseBreakdown.length > 0;

    const rows: Array<Array<string | number>> = [
      ['Report Name', 'Profit & Loss Report'],
      ['Start Date', this.startDate],
      ['End Date', this.endDate],
      ['Generated At', this.generatedAt.toLocaleString()],
      [],
      ['Summary'],
      ['Metric', 'Amount (BDT)'],
      ['Total Revenue', this.csvNumber(this.totalRevenue())],
      ['Cost of Goods Sold / Purchase Cost', this.csvNumber(this.costOfGoodsSold())],
      ['Gross Profit', this.csvNumber(this.grossProfit())],
      ['Total Expenses', this.csvNumber(this.totalExpenses())],
      ['Net Profit', this.csvNumber(this.netProfit())],
      ['Gross Profit Margin %', this.csvPercent(this.profitLoss.grossProfitMargin)],
      ['Net Profit Margin %', this.csvPercent(this.profitLoss.netProfitMargin)],
      ['Sales Count', Number(this.profitLoss.salesCount || 0)],
      ['Purchase Count', Number(this.profitLoss.purchaseCount || 0)],
      ['Expense Count', Number(this.profitLoss.expenseCount || 0)],
      []
    ];

    if (!hasData) {
      rows.push(['Note', 'No data found for selected date range'], []);
    }

    rows.push(['Revenue Breakdown']);
    rows.push(['Source', 'Count', 'Amount (BDT)', 'Percentage']);
    if (revenueBreakdown.length) {
      revenueBreakdown.forEach(row => rows.push([
        this.safeCsvText(row.source),
        Number(row.count || 0),
        this.csvNumber(row.amount),
        this.csvPercent(row.percentage)
      ]));
    } else {
      rows.push(['No revenue found', 0, this.csvNumber(0), this.csvPercent(0)]);
    }

    rows.push([], ['Expense Breakdown']);
    rows.push(['Expense Category', 'Count', 'Amount (BDT)', 'Percentage']);
    if (expenseBreakdown.length) {
      expenseBreakdown.forEach(row => rows.push([
        this.safeCsvText(row.categoryName),
        Number(row.count || 0),
        this.csvNumber(row.amount),
        this.csvPercent(row.percentage)
      ]));
    } else {
      rows.push(['No expenses found', 0, this.csvNumber(0), this.csvPercent(0)]);
    }

    rows.push([], ['Purchase / Cost Breakdown']);
    rows.push(['Type', 'Count', 'Amount (BDT)', 'Percentage']);
    if (purchaseBreakdown.length) {
      purchaseBreakdown.forEach(row => rows.push([
        this.safeCsvText(row.type),
        Number(row.count || 0),
        this.csvNumber(row.amount),
        this.csvPercent(row.percentage)
      ]));
    } else {
      rows.push(['No cost data found', 0, this.csvNumber(0), this.csvPercent(0)]);
    }

    rows.push(
      [],
      ['Profit Calculation'],
      ['Description', 'Amount (BDT)'],
      ['Total Revenue', this.csvNumber(this.totalRevenue())],
      ['Less: Cost of Goods Sold', this.csvNumber(this.costOfGoodsSold())],
      ['Gross Profit', this.csvNumber(this.grossProfit())],
      ['Less: Total Expenses', this.csvNumber(this.totalExpenses())],
      ['Net Profit', this.csvNumber(this.netProfit())],
      [],
      ['Business Insights']
    );

    const insights = this.profitLoss.insights || [];
    if (insights.length) {
      insights.forEach(message => rows.push([this.safeCsvText(message)]));
    } else {
      rows.push(['No insight available for this period']);
    }

    const csv = rows.map(row => row.map(cell => this.escapeCsv(cell)).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profit-loss-report-${this.startDate}-to-${this.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  totalRevenue(): number { return Number(this.profitLoss?.totalRevenue ?? this.profitLoss?.revenue ?? 0); }
  costOfGoodsSold(): number { return Number(this.profitLoss?.costOfGoodsSold ?? this.profitLoss?.totalPurchaseCost ?? 0); }
  grossProfit(): number { return Number(this.profitLoss?.grossProfit ?? (this.totalRevenue() - this.costOfGoodsSold())); }
  totalExpenses(): number { return Number(this.profitLoss?.totalExpenses ?? this.profitLoss?.expenses ?? 0); }
  netProfit(): number { return Number(this.profitLoss?.netProfit ?? 0); }

  formatCurrency(value: any): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatPercent(value: any): string {
    return `${Number(value || 0).toFixed(2)}%`;
  }

  insightClass(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('loss') || lower.includes('high')) return 'warning';
    if (lower.includes('profitable')) return 'success';
    return 'info';
  }

  private renderCharts(): void {
    if (!this.profitLoss) return;
    this.renderSummaryChart();
    this.renderTrendChart();
    this.renderExpenseChart();
  }

  private renderSummaryChart(): void {
    const ctx = document.getElementById('plSummaryChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.summaryChart?.destroy();
    this.summaryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Revenue', 'Expenses', 'Net Profit'],
        datasets: [{
          label: 'Amount',
          data: [this.totalRevenue(), this.totalExpenses(), this.netProfit()],
          backgroundColor: ['#86efac', '#fca5a5', this.netProfit() >= 0 ? '#93c5fd' : '#fecaca'],
          borderColor: ['#15803d', '#dc2626', this.netProfit() >= 0 ? '#1d4ed8' : '#dc2626'],
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: this.chartOptions(false)
    });
  }

  private renderTrendChart(): void {
    const ctx = document.getElementById('plTrendChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.trendChart?.destroy();
    const trend = this.profitLoss?.profitTrend || [];
    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trend.map(row => row.label),
        datasets: [
          this.lineDataset('Revenue', trend.map(row => Number(row.revenue || 0)), '#16a34a'),
          this.lineDataset('Expenses', trend.map(row => Number(row.expenses || 0)), '#dc2626'),
          this.lineDataset('Net Profit', trend.map(row => Number(row.netProfit || 0)), '#1d4ed8')
        ]
      },
      options: this.chartOptions(true)
    });
  }

  private renderExpenseChart(): void {
    const ctx = document.getElementById('plExpenseChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.expenseChart?.destroy();
    const breakdown = this.profitLoss?.expenseBreakdown || [];
    this.expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: breakdown.map(row => row.categoryName),
        datasets: [{
          data: breakdown.map(row => Number(row.amount || 0)),
          backgroundColor: ['#bbf7d0', '#bfdbfe', '#fde68a', '#e9d5ff', '#fecaca', '#a5f3fc'],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } } } }
    });
  }

  private chartOptions(showLegend: boolean): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: showLegend } },
      scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
    };
  }

  private lineDataset(label: string, data: number[], color: string): any {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: `${color}22`,
      fill: true,
      tension: 0.35,
      pointRadius: 3
    };
  }

  private destroyCharts(): void {
    this.summaryChart?.destroy();
    this.trendChart?.destroy();
    this.expenseChart?.destroy();
  }

  private csvNumber(value: any): string {
    return Number(value || 0).toFixed(2);
  }

  private csvPercent(value: any): string {
    return Number(value || 0).toFixed(2);
  }

  private safeCsvText(value: any): string {
    return value === null || value === undefined || value === '' ? 'N/A' : String(value);
  }

  private escapeCsv(value: string | number): string {
    const text = this.safeCsvText(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  private toDateInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
