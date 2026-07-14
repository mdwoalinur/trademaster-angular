import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  category: Category = new Category();
  allCategories: Category[] = [];
  isEdit = false;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadAllCategories();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.isEdit = true;
        this.loadCategory(id);
      }
    }
  }

  loadAllCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.allCategories = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (data) => {
        this.category = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['./products/categories']);
      }
    });
  }

  save(): void {
    if (!this.category.categoryName) {
      this.alert.warning('ALERT.VALIDATION.CATEGORY_NAME_REQUIRED');
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      if (!this.category.categoryId) {
        this.alert.error(null, 'ALERT.MISSING_UPDATE_ID');
        this.loading = false;
        return;
      }
      this.categoryService.updateCategory(this.category.categoryId, this.category).subscribe({
        next: () => this.router.navigate(['./products/categories']),
        error: (err) => this.handleError(err)
      });
    } else {
      this.categoryService.createCategory(this.category).subscribe({
        next: () => this.router.navigate(['./products/categories']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    console.error(err);
    this.alert.error(err);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['./products/categories']);
  }
}
