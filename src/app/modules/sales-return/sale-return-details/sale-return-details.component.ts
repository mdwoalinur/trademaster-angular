import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleReturnService } from 'src/app/services/sale-return.service';
import { SaleReturn } from 'src/app/models/sale-return.model';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-sale-return-details',
  templateUrl: './sale-return-details.component.html',
  styleUrls: ['./sale-return-details.component.css']
})
export class SaleReturnDetailsComponent implements OnInit {
  saleReturn: SaleReturn | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private returnService: SaleReturnService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/sales-returns']);
      return;
    }
    this.loadReturn(id);
  }

  loadReturn(id: number): void {
    this.loading = true;
    this.returnService.getById(id).subscribe({
      next: (data) => {
        this.saleReturn = data;
        this.loading = false;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load return details', 'error');
        this.router.navigate(['/sales-returns']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/sales-returns']);
  }
}