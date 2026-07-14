import { Component, OnInit } from '@angular/core';
import { PaymentService } from 'src/app/services/payment.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-payment-dashboard',
  templateUrl: './payment-dashboard.component.html',
  styleUrls: ['./payment-dashboard.component.css']
})
export class PaymentDashboardComponent implements OnInit {
  data: any = {};
  startDate = '';
  endDate = '';
  loading = false;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.paymentService.dashboard(this.startDate || undefined, this.endDate || undefined).subscribe({
      next: data => {
        this.data = data || {};
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load payment dashboard', 'error');
      }
    });
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = Number(value || 0);
    return '৳' + amount.toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
