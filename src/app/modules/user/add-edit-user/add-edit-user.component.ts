import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { Role } from 'src/app/models/role.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.css']
})
export class AddEditUserComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  userId: number | null = null;
  roles: Role[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService
  ) {
    this.userForm = this.fb.group({
      roleId: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      isActive: [true]
    });
    // Password field is only required on create
    if (!this.isEdit) {
      this.userForm.addControl('passwordHash', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    }
  }

  ngOnInit(): void {
    this.loadRoles();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.userId = +idParam;
      this.loadUser();
      // Remove password requirement for edit
      if (this.userForm.contains('passwordHash')) {
        this.userForm.removeControl('passwordHash');
      }
    }
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Failed to load roles', err)
    });
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getById(this.userId!).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          roleId: user.roleId,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive
        });
        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load user', 'error');
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Swal.fire('Validation Error', 'Please fill all required fields correctly', 'warning');
      return;
    }

    this.loading = true;
    const formValue = this.userForm.value;

    if (this.isEdit && this.userId) {
      this.userService.update(this.userId, formValue).subscribe({
        next: () => {
          Swal.fire('Success', 'User updated successfully', 'success');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', err.error?.message || 'Update failed', 'error');
          this.loading = false;
        }
      });
    } else {
      this.userService.create(formValue).subscribe({
        next: () => {
          Swal.fire('Success', 'User created successfully', 'success');
          this.router.navigate(['/users']);
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
    this.router.navigate(['/users']);
  }
}