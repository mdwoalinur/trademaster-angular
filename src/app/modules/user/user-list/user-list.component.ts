import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { User } from 'src/app/models/user.model';
import { Role } from 'src/app/models/role.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
        next: (data) => this.roles = data,
        error: (err) => console.error('Failed to load roles', err)
    });
}

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll(this.currentPage - 1, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load users', 'error');
      }
    });
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.roleName : 'Unknown';
  }

  addUser(): void {
    this.router.navigate(['/users/add']);
  }

  editUser(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  deleteUser(id: number): void {
    Swal.fire({
      title: 'Deactivate User?',
      text: 'User will be deactivated, not permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, deactivate'
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.delete(id).subscribe({
          next: () => {
            Swal.fire('Deactivated', 'User has been deactivated', 'success');
            this.loadUsers();
          },
          error: () => Swal.fire('Error', 'Deactivation failed', 'error')
        });
      }
    });
  }

  getStatusBadge(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  firstPage(): void {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  lastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.loadUsers();
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }
}