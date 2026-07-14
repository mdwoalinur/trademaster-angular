import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoleService } from 'src/app/services/role.service';
import { Role } from 'src/app/models/role.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAll(this.currentPage - 1, this.pageSize).subscribe({
      next: (res) => {
        this.roles = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load roles', 'error');
      }
    });
  }

  addRole(): void {
    this.router.navigate(['/roles/add']);
  }

  editRole(id: number): void {
    this.router.navigate(['/roles/edit', id]);
  }

  deleteRole(id: number): void {
    Swal.fire({
      title: 'Deactivate Role?',
      text: 'Role will be deactivated, users assigned to this role will still exist.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, deactivate'
    }).then(result => {
      if (result.isConfirmed) {
        this.roleService.delete(id).subscribe({
          next: () => {
            Swal.fire('Deactivated', 'Role deactivated successfully', 'success');
            this.loadRoles();
          },
          error: () => Swal.fire('Error', 'Deactivation failed', 'error')
        });
      }
    });
  }

  getStatusBadge(status: boolean): string {
    return status ? 'bg-success' : 'bg-secondary';
  }

  firstPage(): void {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.loadRoles();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRoles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRoles();
    }
  }

  lastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.loadRoles();
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }
}