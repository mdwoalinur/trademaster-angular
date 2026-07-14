import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockTransferService } from 'src/app/services/stock-transfer.service';
import { StockTransfer } from 'src/app/models/stock-transfer.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
    selector: 'app-stock-transfer-list',
    templateUrl: './stock-transfer-list.component.html',
    styleUrls: ['./stock-transfer-list.component.css']
})
export class StockTransferListComponent implements OnInit {
    transfers: StockTransfer[] = [];
    loading = false;
    currentPage = 1;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    Math = Math;  // ✅ for template

    constructor(
        private transferService: StockTransferService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadTransfers();
    }

    loadTransfers(): void {
        this.loading = true;
        this.transferService.getAll(this.currentPage - 1, this.pageSize).subscribe({
            next: (res) => {
                this.transfers = res.content;
                this.totalElements = res.totalElements;
                this.totalPages = res.totalPages;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                Swal.fire('Error', 'Failed to load transfers', 'error');
            }
        });
    }

    // ✅ Pagination methods
    firstPage(): void {
        if (this.currentPage !== 1) {
            this.currentPage = 1;
            this.loadTransfers();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadTransfers();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadTransfers();
        }
    }

    lastPage(): void {
        if (this.currentPage !== this.totalPages) {
            this.currentPage = this.totalPages;
            this.loadTransfers();
        }
    }

    addTransfer(): void {
        this.router.navigate(['/stock-transfers/add']);
    }

    viewTransfer(id: number): void {
        this.router.navigate(['/stock-transfers/view', id]);
    }

    approveTransfer(id: number): void {
        Swal.fire({
            title: 'Approve Transfer?',
            text: 'Stock will be moved between warehouses.',
            icon: 'question',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed) {
                this.transferService.approve(id, 1).subscribe({
                    next: () => {
                        Swal.fire('Approved', 'Transfer approved and stock updated', 'success');
                        this.loadTransfers();
                    },
                    error: () => Swal.fire('Error', 'Approval failed', 'error')
                });
            }
        });
    }

    rejectTransfer(id: number): void {
        Swal.fire({
            title: 'Reject Transfer?',
            icon: 'warning',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed) {
                this.transferService.reject(id).subscribe({
                    next: () => {
                        Swal.fire('Rejected', 'Transfer rejected', 'success');
                        this.loadTransfers();
                    },
                    error: () => Swal.fire('Error', 'Rejection failed', 'error')
                });
            }
        });
    }

    cancelTransfer(id: number): void {
        Swal.fire({
            title: 'Cancel Transfer?',
            icon: 'warning',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed) {
                this.transferService.cancel(id).subscribe({
                    next: () => {
                        Swal.fire('Cancelled', 'Transfer cancelled', 'success');
                        this.loadTransfers();
                    },
                    error: () => Swal.fire('Error', 'Cancel failed', 'error')
                });
            }
        });
    }

    getStatusBadge(status: string): string {
        switch(status) {
            case 'APPROVED': return 'bg-success';
            case 'REJECTED': return 'bg-danger';
            case 'CANCELLED': return 'bg-secondary';
            default: return 'bg-warning text-dark';
        }
    }

    formatDate(date: string): string {
        return date ? new Date(date).toLocaleString() : '-';
    }
}