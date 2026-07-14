import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseCategoryService } from 'src/app/services/expense-category.service';
import { ExpenseCategory } from 'src/app/models/expense-category.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-edit-category',
  templateUrl: './add-edit-category.component.html',
  styleUrls: ['./add-edit-category.component.css']
})
export class AddEditCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  isEdit = false;
  categoryId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: ExpenseCategoryService
  ) {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required]],
      categoryCode: ['', [Validators.required]],
      parentCategoryId: [null],
      description: [''],
      status: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.categoryId = +id;
      this.loadCategory();
    }
  }

  loadCategory(): void {
    this.loading = true;
    this.categoryService.getById(this.categoryId!).subscribe({
      next: (data) => {
        this.categoryForm.patchValue(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load category', 'error');
        this.router.navigate(['/expenses/categories']);
      }
    });
  }

  save(): void {
    if (this.categoryForm.invalid) {
      Swal.fire('Validation', 'Please fill all required fields', 'warning');
      return;
    }

    const data: ExpenseCategory = this.categoryForm.value;
    this.loading = true;

    const request = this.isEdit && this.categoryId
      ? this.categoryService.update(this.categoryId, data)
      : this.categoryService.create(data);

    request.subscribe({
      next: () => {
        Swal.fire('Success', `Category ${this.isEdit ? 'updated' : 'created'}`, 'success');
        this.router.navigate(['/expenses/categories']);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Operation failed', 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/expenses/categories']);
  }
}