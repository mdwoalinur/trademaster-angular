
import { Component, OnInit } from '@angular/core';
import { PurchaseReportService } from 'src/app/services/purchase-report.service';
import { PurchaseReport, PurchaseItem, SupplierSummary } from 'src/app/models/purchase-report.model';

@Component({
  selector: 'app-purchase-report',
  templateUrl: './purchase-report.component.html',
  styleUrls: ['./purchase-report.component.css']
})
export class PurchaseReportComponent implements OnInit {
  startDate: string;
  endDate: string;
  report: PurchaseReport | null = null;
  loading = false;
  error = '';

  currentPage = 1;
  pageSize = 10;
  Math = Math;

  constructor(private purchaseReportService: PurchaseReportService) {
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
    this.purchaseReportService.getPurchaseReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.report = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load purchase report';
        this.loading = false;
        console.error(err);
      }
    });
  }

  get paginatedPurchases(): PurchaseItem[] {
    if (!this.report?.purchases) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.report.purchases.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    if (!this.report?.purchases) return 0;
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

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleDateString() : '-';
  }
}
