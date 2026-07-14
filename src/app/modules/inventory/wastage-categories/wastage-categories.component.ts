import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-wastage-categories',
  templateUrl: './wastage-categories.component.html',
  styleUrls: ['./wastage-categories.component.css']
})
export class WastageCategoriesComponent implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];  
  loading = false;
  searchTerm = '';                 
  selectedStatus = '';            
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.inventoryService.getWastageCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilters();  
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to load categories:', err);
        Swal.fire('Error', 'Failed to load categories', 'error');
      }
    });
  }

  // Apply filters method
  applyFilters(): void {
    let filtered = [...this.categories];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.categoryName?.toLowerCase().includes(term) ||
        c.categoryCode?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedStatus && this.selectedStatus !== 'ALL') {
      const active = this.selectedStatus === 'ACTIVE';
      filtered = filtered.filter(c => c.status === active);
    }
    
    this.filteredCategories = filtered;
  }

  //  Reset filters
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  deleteCategory(id: number): void {
    Swal.fire({
      title: 'Delete Category?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.inventoryService.deleteWastageCategory(id).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Category deleted', 'success');
            this.loadCategories();
          },
          error: (err) => {
            console.error('Delete failed:', err);
            Swal.fire('Error', err.error?.message || 'Delete failed', 'error');
          }
        });
      }
    });
  }

  //  Get status badge class
  getStatusBadge(status: boolean): string {
    return status ? 'bg-success' : 'bg-secondary';
  }

  //  Get status text
  getStatusText(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }
}