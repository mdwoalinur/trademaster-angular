import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from 'src/app/services/role.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-edit-role',
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.css']
})
export class AddEditRoleComponent implements OnInit {
  roleForm: FormGroup;
  isEdit = false;
  roleId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: [true]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.roleId = +idParam;
      this.loadRole();
    }
  }

  loadRole(): void {
    this.loading = true;
    this.roleService.getById(this.roleId!).subscribe({
      next: (role) => {
        this.roleForm.patchValue({
          roleName: role.roleName,
          description: role.description,
          status: role.status
        });
        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load role', 'error');
        this.router.navigate(['/roles']);
      }
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      Swal.fire('Validation Error', 'Please fill the form correctly', 'warning');
      return;
    }

    this.loading = true;
    const formValue = this.roleForm.value;

    if (this.isEdit && this.roleId) {
      this.roleService.update(this.roleId, formValue).subscribe({
        next: () => {
          Swal.fire('Success', 'Role updated successfully', 'success');
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', err.error?.message || 'Update failed', 'error');
          this.loading = false;
        }
      });
    } else {
      this.roleService.create(formValue).subscribe({
        next: () => {
          Swal.fire('Success', 'Role created successfully', 'success');
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', err.error?.message || 'Creation failed', 'error');
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }
}