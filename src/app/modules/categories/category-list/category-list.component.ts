import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
      }
    });
  }

  get filteredCategories(): Category[] {
    let filtered = this.categories;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.categoryName.toLowerCase().includes(term)
      );
    }
    if (this.filterStatus !== 'ALL') {
      const active = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(c => c.status === active);
    }
    return filtered;
  }

  addCategory(): void {
    this.router.navigate(['/products/categories/add']);
  }

  editCategory(category: Category): void {
    this.router.navigate(['/products/categories/edit', category.categoryId]);
  }

  deleteCategory(category: Category): void {
    if (!category.categoryId) return;
    const categoryId = category.categoryId;
    this.alert.delete('ALERT.ENTITY.CATEGORY', category.categoryName).then(result => {
      if (!result.isConfirmed) return;
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.loadCategories();
          this.alert.success('ALERT.DELETED_SUCCESS');
        },
        error: (err) => this.alert.error(err, 'ALERT.DELETE_FAILED')
      });
    });
  }

  getStatusClass(status: boolean): string {
    return status ? 'badge bg-success' : 'badge bg-secondary';
  }

  getStatusText(status: boolean): string {
    return status ? 'ACTIVE' : 'INACTIVE';
  }

  getParentName(parentId: number | null): string {
    if (!parentId) return 'None';
    const parent = this.categories.find(c => c.categoryId === parentId);
    return parent ? parent.categoryName : 'Unknown';
  }
}
