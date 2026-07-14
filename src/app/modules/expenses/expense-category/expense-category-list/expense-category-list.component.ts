
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseCategoryService } from 'src/app/services/expense-category.service';
import { ExpenseCategory } from 'src/app/models/expense-category.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-expense-category-list',
  templateUrl: './expense-category-list.component.html',
  styleUrls: ['./expense-category-list.component.css']
})
export class ExpenseCategoryListComponent implements OnInit {
  categories: ExpenseCategory[] = [];
  filteredCategories: ExpenseCategory[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';

  constructor(
    private categoryService: ExpenseCategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load categories', 'error');
      }
    });
  }

  applyFilter(): void {
    let filtered = this.categories;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.categoryName.toLowerCase().includes(term) ||
        c.categoryCode.toLowerCase().includes(term)
      );
    }
    if (this.filterStatus !== 'ALL') {
      const active = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(c => c.status === active);
    }
    this.filteredCategories = filtered;
  }

  deleteCategory(id: number): void {
    Swal.fire({
      title: 'Delete Category?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.categoryService.delete(id).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Category deleted', 'success');
            this.loadCategories();
          },
          error: () => Swal.fire('Error', 'Delete failed', 'error')
        });
      }
    });
  }

  addCategory(): void {
    this.router.navigate(['/expenses/categories/add']);
  }

  editCategory(id: number): void {
    this.router.navigate(['/expenses/categories/edit', id]);
  }
}