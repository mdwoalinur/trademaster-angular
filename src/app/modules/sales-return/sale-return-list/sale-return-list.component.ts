import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SaleReturnService } from 'src/app/services/sale-return.service';
import { SaleReturn } from 'src/app/models/sale-return.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
    selector: 'app-sale-return-list',
    templateUrl: './sale-return-list.component.html',
    styleUrls: ['./sale-return-list.component.css']
})
export class SaleReturnListComponent implements OnInit {
    returns: SaleReturn[] = [];
    loading = false;
    currentPage = 1;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    searchStatus = '';
    statusOptions = ['', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
    Math = Math;

    constructor(
        private returnService: SaleReturnService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadReturns();
    }

    loadReturns(): void {
        this.loading = true;
        this.returnService.getAll(this.currentPage - 1, this.pageSize, this.searchStatus)
            .subscribe({
                next: (res) => {
                    this.returns = res.content;
                    this.totalElements = res.totalElements;
                    this.totalPages = res.totalPages;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    Swal.fire('Error', 'Failed to load returns', 'error');
                }
            });
    }

    onStatusChange(): void { this.currentPage = 1; this.loadReturns(); }
    resetFilters(): void { this.searchStatus = ''; this.currentPage = 1; this.loadReturns(); }

   viewReturn(id: number): void {
    
    if (!id || id === 0) {
        Swal.fire('Error', 'Invalid return ID', 'error');
        return;
    }
    this.router.navigate(['/sales-returns/view', id]);
     
}

    approveReturn(id: number): void {
        Swal.fire({
            title: 'Approve Return?',
            text: 'Stock will be restored and customer due will be adjusted.',
            icon: 'question',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed) {
                this.returnService.approve(id, 1).subscribe({
                    next: () => {
                        Swal.fire('Approved', 'Return approved successfully', 'success');
                        this.loadReturns();
                    },
                    error: () => Swal.fire('Error', 'Approval failed', 'error')
                });
            }
        });
    }

    rejectReturn(id: number): void {
        Swal.fire({
            title: 'Reject Return?',
            input: 'text',
            inputLabel: 'Reason for rejection',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed && result.value) {
                this.returnService.reject(id, result.value).subscribe({
                    next: () => {
                        Swal.fire('Rejected', 'Return rejected', 'success');
                        this.loadReturns();
                    },
                    error: () => Swal.fire('Error', 'Rejection failed', 'error')
                });
            }
        });
    }

    deleteReturn(id: number): void {
        Swal.fire({
            title: 'Delete Return?',
            text: 'Only pending returns can be deleted.',
            icon: 'warning',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed) {
                this.returnService.delete(id).subscribe({
                    next: () => {
                        Swal.fire('Deleted', 'Return deleted', 'success');
                        this.loadReturns();
                    },
                    error: () => Swal.fire('Error', 'Delete failed', 'error')
                });
            }
        });
    }

    addReturn(): void {
        Swal.fire('Select Sale', 'Choose a sale and click Return to create a return request.', 'info');
        this.router.navigate(['/sales']);
    }
    

    getStatusBadge(status: string): string {
        switch(status) {
            case 'APPROVED': return 'bg-success';
            case 'REJECTED': return 'bg-danger';
            case 'PENDING': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }

    formatDate(date: string): string {
        return date ? new Date(date).toLocaleDateString() : '-';
    }

    formatCurrency(amount: number): string {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'BDT' });
    }

    firstPage(): void { if (this.currentPage !== 1) { this.currentPage = 1; this.loadReturns(); } }
    previousPage(): void { if (this.currentPage > 1) { this.currentPage--; this.loadReturns(); } }
    nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadReturns(); } }
    lastPage(): void { if (this.currentPage !== this.totalPages) { this.currentPage = this.totalPages; this.loadReturns(); } }
}
