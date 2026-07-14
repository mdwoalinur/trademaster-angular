
import { Component, OnInit } from '@angular/core';
import { SalesReportService } from 'src/app/services/sales-report.service';
import { SalesReport } from 'src/app/models/sales-report.model';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {
  startDate: string;
  endDate: string;
  report: SalesReport | null = null;
  loading = false;
  error = '';

  // Pagination for table
  currentPage = 1;
  pageSize = 10;
  Math = Math;

  constructor(private salesReportService: SalesReportService) {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    this.endDate = now.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.error = '';
    this.salesReportService.getSalesReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.report = data;
        this.currentPage = 1; 
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load sales report';
        this.loading = false;
        console.error(err);
      }
    });
  }

  get paginatedSales(): any[] {
    if (!this.report?.sales) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.report.sales.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    if (!this.report?.sales) return 0;
    return Math.ceil(this.report.totalCount / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatDate(date: Date | string): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }
}
