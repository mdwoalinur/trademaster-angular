import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from 'src/app/services/inventory.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-wastage-category',
  templateUrl: './add-wastage-category.component.html',
  styleUrls: ['./add-wastage-category.component.css']
})
export class AddWastageCategoryComponent implements OnInit {
  categoryForm: FormGroup;
  isEdit = false;
  categoryId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService
  ) {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2)]],
      categoryCode: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      lossPercentage: [0, [Validators.min(0), Validators.max(100)]],
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
    this.inventoryService.getWastageCategoryById(this.categoryId!).subscribe({
      next: (data) => {
        this.categoryForm.patchValue({
          categoryName: data.categoryName,
          categoryCode: data.categoryCode,
          description: data.description,
          lossPercentage: data.lossPercentage,
          status: data.status
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load category:', err);
        Swal.fire('Error', 'Failed to load category', 'error');
        this.router.navigate(['/inventory/wastage/categories']);
      }
    });
  }

  save(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      Swal.fire('Validation Error', 'Please fill all required fields correctly', 'warning');
      return;
    }

    const formValue = this.categoryForm.value;
    
    
    const data = {
      categoryName: formValue.categoryName?.trim(),
      categoryCode: formValue.categoryCode?.trim().toUpperCase(), 
      description: formValue.description?.trim() || null,
      lossPercentage: formValue.lossPercentage ? Number(formValue.lossPercentage) : 0,
      status: formValue.status === true,
      companyId: 1,      
      createdBy: 1         
    };

    console.log('Saving category:', data);
    this.loading = true;

    if (this.isEdit && this.categoryId) {
      this.inventoryService.updateWastageCategory(this.categoryId, data).subscribe({
        next: () => {
          Swal.fire('Success', 'Category updated successfully', 'success');
          this.router.navigate(['/inventory/wastage/categories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Update failed:', err);
          const errorMsg = err.error?.message || 'Update failed';
          Swal.fire('Error', errorMsg, 'error');
        }
      });
    } else {
      this.inventoryService.createWastageCategory(data).subscribe({
        next: () => {
          Swal.fire('Success', 'Category created successfully', 'success');
          this.router.navigate(['/inventory/wastage/categories']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Creation failed:', err);
          const errorMsg = err.error?.message || 'Creation failed';
          Swal.fire('Error', errorMsg, 'error');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/inventory/wastage/categories']);
  }

  //Helper getters for template validation
  get categoryName() { return this.categoryForm.get('categoryName'); }
  get categoryCode() { return this.categoryForm.get('categoryCode'); }
  get lossPercentage() { return this.categoryForm.get('lossPercentage'); }
}