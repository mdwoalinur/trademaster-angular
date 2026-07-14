import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinancialAccount, FinancialAccountType } from 'src/app/models/financial-account.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-edit-financial-account',
  templateUrl: './add-edit-financial-account.component.html',
  styleUrls: ['./add-edit-financial-account.component.css']
})
export class AddEditFinancialAccountComponent implements OnInit {
  accountForm: FormGroup;
  accountId: number | null = null;
  isEdit = false;
  loading = false;
  accountTypes: FinancialAccountType[] = ['CASH', 'BANK', 'MOBILE_BANKING', 'CARD_CLEARING', 'OTHER'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: FinancialAccountService
  ) {
    this.accountForm = this.fb.group({
      accountCode: ['', Validators.required],
      accountName: ['', Validators.required],
      accountType: ['CASH', Validators.required],
      accountNumber: [''],
      bankName: [''],
      branchName: [''],
      mobileProvider: [''],
      currencyCode: ['BDT', Validators.required],
      openingBalance: [0, Validators.min(0)],
      allowOverdraft: [false],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.accountId = Number(id);
      this.loadAccount();
    }
  }

  loadAccount(): void {
    this.loading = true;
    this.accountService.getById(this.accountId!).subscribe({
      next: account => {
        this.accountForm.patchValue(account);
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Failed to load account', 'error');
        this.router.navigate(['/payments/accounts']);
      }
    });
  }

  save(): void {
    if (this.accountForm.invalid) {
      Swal.fire('Validation', 'Please fill all required account fields', 'warning');
      return;
    }

    const raw = this.accountForm.value;
    const account: FinancialAccount = {
      ...raw,
      openingBalance: Number(raw.openingBalance || 0),
      allowOverdraft: !!raw.allowOverdraft
    };

    this.loading = true;
    const request = this.isEdit && this.accountId
      ? this.accountService.update(this.accountId, account)
      : this.accountService.create(account);

    request.subscribe({
      next: () => {
        Swal.fire('Success', `Financial account ${this.isEdit ? 'updated' : 'created'}`, 'success');
        this.router.navigate(['/payments/accounts']);
      },
      error: err => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Save failed', 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/payments/accounts']);
  }
}
