import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { TaxReportService } from 'src/app/services/tax-report.service';
import { TaxReport } from 'src/app/models/tax-report.model';

type QuickFilter = 'today' | 'week' | 'month' | 'year';
type TaxReportTab = 'sales' | 'purchase' | 'rates' | 'final';

@Component({
  selector: 'app-tax-report',
  templateUrl: './tax-report.component.html',
  styleUrls: ['./tax-report.component.css']
})
export class TaxReportComponent implements OnInit, OnDestroy {
  startDate: string;
  endDate: string;
  report: TaxReport | null = null;
  loading = false;
  error = '';
  generatedAt = new Date();
  activeTab: TaxReportTab = 'sales';

  private comparisonChart?: Chart;
  private trendChart?: Chart;
  private contributionChart?: Chart;

  constructor(private taxReportService: TaxReportService) {
    const now = new Date();
    this.startDate = this.toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    this.endDate = this.toDateInput(now);
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
    this.taxReportService.getTaxReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.report = data;
        this.generatedAt = new Date();
        this.loading = false;
        setTimeout(() => this.renderCharts());
      },
      error: (err) => {
        this.error = 'Failed to load tax report';
        this.loading = false;
        console.error(err);
      }
    });
  }

  resetFilters(): void {
    const now = new Date();
    this.startDate = this.toDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    this.endDate = this.toDateInput(now);
    this.loadReport();
  }

  applyQuickFilter(filter: QuickFilter): void {
    const now = new Date();
    let start = new Date(now);
    if (filter === 'week') {
      const day = now.getDay() || 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
    } else if (filter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filter === 'year') {
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
    if (!this.report) return;
    const salesRows = this.report.salesTaxBreakdown || [];
    const purchaseRows = this.report.purchaseTaxBreakdown || [];
    const rateRows = this.report.taxSummaryByRate || [];
    const hasData = this.totalSalesAmount() !== 0
      || this.totalPurchaseAmount() !== 0
      || this.salesTaxOutput() !== 0
      || this.purchaseTaxInput() !== 0
      || salesRows.length > 0
      || purchaseRows.length > 0;

    const rows: Array<Array<string | number>> = [
      ['Report Name', 'Tax Report (GST / VAT)'],
      ['Start Date', this.startDate],
      ['End Date', this.endDate],
      ['Generated At', this.generatedAt.toLocaleString()],
      [],
      ['Summary'],
      ['Metric', 'Amount / Value'],
      ['Total Sales Amount (BDT)', this.csvNumber(this.totalSalesAmount())],
      ['Sales Tax / Output VAT (BDT)', this.csvNumber(this.salesTaxOutput())],
      ['Total Purchase Amount (BDT)', this.csvNumber(this.totalPurchaseAmount())],
      ['Purchase Tax / Input VAT (BDT)', this.csvNumber(this.purchaseTaxInput())],
      ['Net VAT Payable (BDT)', this.csvNumber(this.netTaxPayable())],
      ['Tax Refundable (BDT)', this.csvNumber(this.refundableAmount())],
      ['Total Sales Invoices', this.salesInvoiceCount()],
      ['Total Purchase Invoices', this.purchaseInvoiceCount()],
      ['Average Tax Rate %', this.csvPercent(this.averageTaxRate())],
      []
    ];

    if (!hasData) {
      rows.push(['Note', 'No data found for selected date range'], []);
    }

    rows.push(['Sales Tax / Output VAT Breakdown']);
    rows.push(['Invoice No', 'Sale Date', 'Customer Name', 'Taxable Amount (BDT)', 'Tax Rate %', 'Output VAT (BDT)', 'Total Amount (BDT)']);
    if (salesRows.length) {
      salesRows.forEach(row => rows.push([
        this.safeCsvText(row.invoiceNo),
        this.safeCsvText(row.saleDate),
        this.safeCsvText(row.customerName),
        this.csvNumber(row.taxableAmount),
        this.csvPercent(row.taxRate),
        this.csvNumber(row.outputVat),
        this.csvNumber(row.totalAmount)
      ]));
    } else {
      rows.push(['No sales tax data found', '', '', this.csvNumber(0), this.csvPercent(0), this.csvNumber(0), this.csvNumber(0)]);
    }

    rows.push([], ['Purchase Tax / Input VAT Breakdown']);
    rows.push(['Purchase Order No', 'Purchase Date', 'Supplier Name', 'Taxable Amount (BDT)', 'Tax Rate %', 'Input VAT (BDT)', 'Total Amount (BDT)']);
    if (purchaseRows.length) {
      purchaseRows.forEach(row => rows.push([
        this.safeCsvText(row.purchaseOrderNo),
        this.safeCsvText(row.purchaseDate),
        this.safeCsvText(row.supplierName),
        this.csvNumber(row.taxableAmount),
        this.csvPercent(row.taxRate),
        this.csvNumber(row.inputVat),
        this.csvNumber(row.totalAmount)
      ]));
    } else {
      rows.push(['No purchase tax data found', '', '', this.csvNumber(0), this.csvPercent(0), this.csvNumber(0), this.csvNumber(0)]);
    }

    rows.push([], ['Tax Summary by Rate']);
    rows.push(['Tax Rate %', 'Sales Taxable Amount (BDT)', 'Output VAT (BDT)', 'Purchase Taxable Amount (BDT)', 'Input VAT (BDT)', 'Net VAT (BDT)']);
    if (rateRows.length) {
      rateRows.forEach(row => rows.push([
        this.csvPercent(row.taxRate),
        this.csvNumber(row.salesTaxableAmount),
        this.csvNumber(row.outputVat),
        this.csvNumber(row.purchaseTaxableAmount),
        this.csvNumber(row.inputVat),
        this.csvNumber(row.netVat)
      ]));
    } else {
      rows.push([this.csvPercent(0), this.csvNumber(0), this.csvNumber(0), this.csvNumber(0), this.csvNumber(0), this.csvNumber(0)]);
    }

    rows.push(
      [],
      ['Final Tax Calculation'],
      ['Description', 'Amount (BDT)'],
      ['Total Output VAT', this.csvNumber(this.salesTaxOutput())],
      ['Less: Total Input VAT', this.csvNumber(this.purchaseTaxInput())],
      ['Net VAT Payable / Refundable', this.csvNumber(this.netTaxPayable())],
      [],
      ['Business Insights']
    );
    (this.report.insights || ['No insight available for this period.']).forEach(message => rows.push([this.safeCsvText(message)]));

    const csv = rows.map(row => row.map(cell => this.escapeCsv(cell)).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tax-report-${this.startDate}-to-${this.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  totalSalesAmount(): number { return Number(this.report?.totalSalesAmount ?? 0); }
  salesTaxOutput(): number { return Number(this.report?.salesTaxOutput ?? this.report?.salesTax ?? 0); }
  totalPurchaseAmount(): number { return Number(this.report?.totalPurchaseAmount ?? 0); }
  purchaseTaxInput(): number { return Number(this.report?.purchaseTaxInput ?? this.report?.purchaseTax ?? 0); }
  netTaxPayable(): number { return Number(this.report?.netTaxPayable ?? this.report?.netTax ?? 0); }
  refundableAmount(): number { return Number(this.report?.refundableAmount ?? Math.max(this.netTaxPayable() * -1, 0)); }
  salesInvoiceCount(): number { return Number(this.report?.salesInvoiceCount ?? 0); }
  purchaseInvoiceCount(): number { return Number(this.report?.purchaseInvoiceCount ?? 0); }
  averageTaxRate(): number { return Number(this.report?.averageTaxRate ?? 0); }

  taxStatus(): string {
    if (this.salesTaxOutput() === 0 && this.purchaseTaxInput() === 0) return 'No taxable transaction found';
    if (this.netTaxPayable() > 0) return 'Pay to Government';
    if (this.netTaxPayable() < 0) return 'Refundable / Carry Forward';
    return 'Balanced';
  }

  reportStatusBadge(): string {
    if (this.netTaxPayable() > 0) return 'Payable';
    if (this.netTaxPayable() < 0) return 'Refundable / Carry Forward';
    return 'No Tax Due';
  }

  taxableTransactionCount(): number {
    return this.salesInvoiceCount() + this.purchaseInvoiceCount();
  }

  setActiveTab(tab: TaxReportTab): void {
    this.activeTab = tab;
  }

  formatCurrency(amount: any): string {
    const value = Number(amount || 0);
    return '৳' + value.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatPercent(value: any): string {
    return `${Number(value || 0).toFixed(2)}%`;
  }

  insightClass(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('payable') || lower.includes('high')) return 'warning';
    if (lower.includes('refundable')) return 'success';
    return 'info';
  }

  private renderCharts(): void {
    if (!this.report) return;
    this.renderComparisonChart();
    this.renderTrendChart();
    this.renderContributionChart();
  }

  private renderComparisonChart(): void {
    const ctx = document.getElementById('taxComparisonChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.comparisonChart?.destroy();
    this.comparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Output VAT', 'Input VAT', 'Net VAT'],
        datasets: [{
          label: 'Tax Amount',
          data: [this.salesTaxOutput(), this.purchaseTaxInput(), this.netTaxPayable()],
          backgroundColor: ['#16a34a', '#155cff', this.netTaxPayable() >= 0 ? '#ff8a00' : '#06b6d4'],
          borderRadius: 8
        }]
      },
      options: this.chartOptions(false)
    });
  }

  private renderTrendChart(): void {
    const ctx = document.getElementById('taxTrendChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.trendChart?.destroy();
    const trend = this.report?.taxTrend || [];
    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trend.map(row => row.label),
        datasets: [
          this.lineDataset('Output VAT', trend.map(row => Number(row.outputVat || 0)), '#16a34a'),
          this.lineDataset('Input VAT', trend.map(row => Number(row.inputVat || 0)), '#155cff'),
          this.lineDataset('Net VAT', trend.map(row => Number(row.netVat || 0)), '#ff8a00')
        ]
      },
      options: this.chartOptions(true)
    });
  }

  private renderContributionChart(): void {
    const ctx = document.getElementById('taxContributionChart') as HTMLCanvasElement;
    if (!ctx) return;
    this.contributionChart?.destroy();
    this.contributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sales Tax / Output VAT', 'Purchase Tax / Input VAT'],
        datasets: [{
          data: [Math.abs(this.salesTaxOutput()), Math.abs(this.purchaseTaxInput())],
          backgroundColor: ['#16a34a', '#155cff']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
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
    this.comparisonChart?.destroy();
    this.trendChart?.destroy();
    this.contributionChart?.destroy();
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
