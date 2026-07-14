
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Expense } from 'src/app/models/expense.model';
import { ExpenseItem } from 'src/app/models/expense-item.model';

/**
 * Component for displaying and printing an expense voucher/invoice.
 * Uses ViewEncapsulation.None so that print styles in the associated CSS
 * can target global elements (like body) when printing.
 */
@Component({
  selector: 'app-expense-invoice',
  templateUrl: './expense-invoice.component.html',
  styleUrls: ['./expense-invoice.component.css'],
  encapsulation: ViewEncapsulation.None   // Required for print styles to work globally
})
export class ExpenseInvoiceComponent {
  /** The expense object to display. */
  @Input() expense: Expense | null = null;
  
  /** List of expense line items. */
  @Input() items: ExpenseItem[] = [];
  
  /** Name of the vendor (supplier) for display. */
  @Input() vendorName: string = '';
  
  /** Map of expense category IDs to their names, used for displaying category names. */
  @Input() categoryMap: Map<number, string> = new Map();
  
  /** Emits when the modal should be closed. */
  @Output() close = new EventEmitter<void>();

  /**
   * Triggers the browser's print dialog.
   * Because of the print styles, only the voucher content will be visible.
   */
  print(): void {
    window.print();
  }

  /**
   * Emits the close event to inform the parent component to hide the modal.
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Returns the category name for a given category ID.
   * @param categoryId - The ID of the expense category.
   * @returns The category name or '—' if not found.
   */
  getCategoryName(categoryId: number | null | undefined): string {
    if (categoryId == null) {
      return '—';
    }
    return this.categoryMap.get(categoryId) || 'Unknown';
  }

  /**
   * Formats a date value into a human-readable string (e.g., "April 19, 2026").
   * @param date - Date object, string, or undefined.
   * @returns Formatted date string or '—' if date is invalid.
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) {
      return '—';
    }
    const parsedDate = new Date(date);
    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      return '—';
    }
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}