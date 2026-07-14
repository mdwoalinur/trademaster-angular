
import { Component, OnInit } from '@angular/core';
import { InventoryReportService } from 'src/app/services/inventory-report.service';
import { InventoryReport, LowStockItem, InventoryItem } from 'src/app/models/inventory-report.model';

@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.css']
})
export class InventoryReportComponent implements OnInit {
  report: InventoryReport | null = null;
  loading = false;
  error = '';

  // Pagination for table
  currentPage = 1;
  pageSize = 10;
  Math = Math;

  constructor(private inventoryReportService: InventoryReportService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.error = '';
    this.inventoryReportService.getInventoryReport().subscribe({
      next: (data) => {
        this.report = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load inventory report';
        this.loading = false;
        console.error(err);
      }
    });
  }

  get paginatedItems(): InventoryItem[] {
    if (!this.report?.allItems) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.report.allItems.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    if (!this.report?.allItems) return 0;
    return Math.ceil(this.report.allItems.length / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getProductImagePath(item: LowStockItem | InventoryItem | any): string {
    return item?.productImageUrl || item?.imageUrl || item?.product?.imageUrl || '';
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
