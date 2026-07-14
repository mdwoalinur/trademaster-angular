
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment.service';
import { Payment, PaymentAllocationInput } from 'src/app/models/payment.model';
import { FinancialAccount } from 'src/app/models/financial-account.model';
import { FinancialAccountService } from 'src/app/services/financial-account.service';
import Swal from 'src/app/services/sweet-alert.helper';

@Component({
  selector: 'app-add-edit-payment',
  templateUrl: './add-edit-payment.component.html',
  styleUrls: ['./add-edit-payment.component.css']
})
export class AddEditPaymentComponent implements OnInit {
  paymentForm: FormGroup;
  isEdit = false;
  paymentId: number | null = null;
  loading = false;
  typeOptions = ['SALE', 'PURCHASE', 'EXPENSE', 'POS', 'CUSTOMER_ADVANCE', 'SUPPLIER_ADVANCE', 'REFUND', 'ADJUSTMENT', 'ACCOUNT_TRANSFER'];
  directionOptions = ['RECEIVE', 'PAY', 'REFUND', 'TRANSFER'];
  partyTypeOptions = ['CUSTOMER', 'SUPPLIER', 'VENDOR', 'EMPLOYEE', 'INTERNAL', 'OTHER'];
  methodOptions = ['CASH', 'BANK', 'MOBILE_BANKING', 'CHEQUE', 'BANK_TRANSFER', 'CARD'];
  activeAccounts: FinancialAccount[] = [];
  parties: any[] = [];
  references: any[] = [];
  allocations: PaymentAllocationInput[] = [];
  partySearch = '';
  referenceSearch = '';
  selectedParty: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private accountService: FinancialAccountService
  ) {
    this.paymentForm = this.fb.group({
      direction: ['RECEIVE', Validators.required],
      paymentType: ['SALE', Validators.required],
      partyType: ['CUSTOMER'],
      partyId: [''],
      referenceId: [''],
      paymentDate: [new Date().toISOString().slice(0, 16), Validators.required],
      requestedAmount: ['', [Validators.required, Validators.min(0.01)]],
      accountId: [''],
      destinationAccountId: [''],
      paymentMethod: ['CASH', Validators.required],
      transactionReference: [''],
      referenceNo: [''],
      cashDrawer: [''],
      receivedAmount: [''],
      changeAmount: [{ value: '', disabled: true }],
      bankName: [''],
      chequeNumber: [''],
      chequeDate: [''],
      expectedClearingDate: [''],
      chequeStatus: ['PENDING'],
      mobileProvider: [''],
      mobileTransactionId: [''],
      cardType: [''],
      cardLastFour: [''],
      gatewayReference: [''],
      approvalCode: [''],
      terminalReference: [''],
      transferDate: [''],
      senderReceiverReference: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadActiveAccounts();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.paymentId = +id;
      this.loadPayment();
    } else {
      this.applyPaymentTypeDefaults();
      this.loadParties();
    }
    this.paymentForm.get('paymentType')?.valueChanges.subscribe(() => {
      this.applyPaymentTypeDefaults();
      this.clearPartyAndAllocations();
      this.loadParties();
    });
    this.paymentForm.valueChanges.subscribe(() => this.calculateChangeAmount());
  }

  loadActiveAccounts(): void {
    this.accountService.getAccounts('ACTIVE').subscribe({
      next: accounts => this.activeAccounts = accounts || [],
      error: err => console.error('Failed to load financial accounts:', err)
    });
  }

  loadPayment(): void {
    this.loading = true;
    this.paymentService.getById(this.paymentId!).subscribe({
      next: (data) => {
        this.paymentForm.patchValue({
          direction: data.direction || 'RECEIVE',
          paymentType: data.paymentType,
          partyType: data.partyType,
          partyId: data.partyId,
          referenceId: data.referenceId,
          paymentDate: data.paymentDate,
          requestedAmount: data.requestedAmount || data.amount,
          accountId: data.accountId,
          destinationAccountId: data.destinationAccountId,
          paymentMethod: data.paymentMethod,
          transactionReference: data.transactionReference,
          referenceNo: data.referenceNo,
          cashDrawer: data.cashDrawer,
          receivedAmount: data.receivedAmount,
          changeAmount: data.changeAmount,
          bankName: data.bankName,
          chequeNumber: data.chequeNumber,
          chequeDate: data.chequeDate,
          expectedClearingDate: data.expectedClearingDate,
          chequeStatus: data.chequeStatus || 'PENDING',
          mobileProvider: data.mobileProvider,
          mobileTransactionId: data.mobileTransactionId,
          cardType: data.cardType,
          cardLastFour: data.cardLastFour,
          gatewayReference: data.gatewayReference,
          approvalCode: data.approvalCode,
          terminalReference: data.terminalReference,
          transferDate: data.transferDate,
          senderReceiverReference: data.senderReceiverReference,
          notes: data.notes
        });
        this.loadAllocations();
        this.loadParties(data.partyId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Failed to load payment', 'error');
        this.router.navigate(['/payments']);
      }
    });
  }

  loadAllocations(): void {
    if (!this.paymentId) return;
    this.paymentService.allocations(this.paymentId).subscribe({
      next: rows => {
        this.allocations = (rows || []).map(row => ({
          referenceType: row.referenceType,
          referenceId: Number(row.referenceId),
          allocatedAmount: Number(row.allocatedAmount || 0),
          discountAmount: Number(row.discountAmount || 0),
          writeOffAmount: Number(row.writeOffAmount || 0),
          referenceNo: row.referenceNo || row.referenceId
        }));
        this.syncAmountFromAllocations();
      },
      error: err => console.error('Failed to load allocations:', err)
    });
  }

  applyPaymentTypeDefaults(): void {
    const type = this.paymentForm.get('paymentType')?.value;
    const partyType = type === 'EXPENSE' ? 'VENDOR'
      : (type === 'PURCHASE' || type === 'SUPPLIER_ADVANCE') ? 'SUPPLIER'
      : type === 'ACCOUNT_TRANSFER' ? 'INTERNAL'
      : 'CUSTOMER';
    const direction = type === 'EXPENSE' || type === 'PURCHASE' || type === 'SUPPLIER_ADVANCE' ? 'PAY'
      : type === 'ACCOUNT_TRANSFER' ? 'TRANSFER'
      : type === 'REFUND' ? 'REFUND'
      : 'RECEIVE';
    this.paymentForm.patchValue({ partyType, direction }, { emitEvent: false });
  }

  clearPartyAndAllocations(): void {
    this.parties = [];
    this.references = [];
    this.allocations = [];
    this.selectedParty = null;
    this.partySearch = '';
    this.referenceSearch = '';
    this.paymentForm.patchValue({ partyId: '', referenceId: '', referenceNo: '', requestedAmount: '' }, { emitEvent: false });
  }

  loadParties(preselectId?: number): void {
    const paymentType = this.paymentForm.get('paymentType')?.value;
    if (this.isAllocationExempt()) {
      this.parties = [];
      return;
    }
    this.paymentService.searchParties(paymentType, this.partySearch).subscribe({
      next: res => {
        this.parties = res?.content || [];
        if (preselectId) {
          this.selectedParty = this.parties.find(p => Number(p.partyId) === Number(preselectId)) || this.selectedParty;
          this.paymentForm.patchValue({ partyId: preselectId }, { emitEvent: false });
          this.loadReferences();
        }
      },
      error: err => console.error('Failed to load payment parties:', err)
    });
  }

  selectParty(party: any): void {
    this.selectedParty = party;
    this.paymentForm.patchValue({
      partyType: party.partyType,
      partyId: party.partyId,
      referenceId: '',
      referenceNo: '',
      requestedAmount: ''
    });
    this.allocations = [];
    this.loadReferences();
  }

  loadReferences(): void {
    const paymentType = this.paymentForm.get('paymentType')?.value;
    const partyId = this.paymentForm.get('partyId')?.value ? Number(this.paymentForm.get('partyId')?.value) : undefined;
    if (this.isAllocationExempt() || !partyId) {
      this.references = [];
      return;
    }
    this.paymentService.outstandingReferences(paymentType, partyId, this.referenceSearch).subscribe({
      next: res => this.references = res?.content || [],
      error: err => console.error('Failed to load outstanding references:', err)
    });
  }

  addAllocation(reference: any): void {
    if (this.allocations.some(item => item.referenceType === reference.referenceType && item.referenceId === reference.referenceId)) {
      Swal.fire('Already Added', 'This reference is already selected', 'info');
      return;
    }
    this.allocations.push({
      referenceType: reference.referenceType,
      referenceId: Number(reference.referenceId),
      allocatedAmount: Number(reference.dueAmount || 0),
      discountAmount: 0,
      writeOffAmount: 0,
      referenceNo: reference.referenceNo,
      dueAmount: Number(reference.dueAmount || 0)
    });
    this.paymentForm.patchValue({
      referenceId: this.allocations[0].referenceId,
      referenceNo: this.allocations[0].referenceNo
    }, { emitEvent: false });
    this.syncAmountFromAllocations();
  }

  removeAllocation(index: number): void {
    this.allocations.splice(index, 1);
    this.paymentForm.patchValue({
      referenceId: this.allocations[0]?.referenceId || '',
      referenceNo: this.allocations[0]?.referenceNo || ''
    }, { emitEvent: false });
    this.syncAmountFromAllocations();
  }

  onAllocationAmountChange(): void {
    this.syncAmountFromAllocations();
  }

  syncAmountFromAllocations(): void {
    const total = this.allocationTotal();
    if (!this.isAllocationExempt()) {
      this.paymentForm.patchValue({ requestedAmount: total ? total.toFixed(2) : '' }, { emitEvent: false });
    }
  }

  allocationTotal(): number {
    return this.allocations.reduce((sum, item) => sum + Number(item.allocatedAmount || 0), 0);
  }

  isAllocationExempt(): boolean {
    return ['ACCOUNT_TRANSFER', 'CUSTOMER_ADVANCE', 'SUPPLIER_ADVANCE', 'REFUND'].includes(this.paymentForm.get('paymentType')?.value);
  }

  save(submit = false): void {
    if (this.paymentForm.invalid) {
      Swal.fire('Validation', 'Please fill all required fields', 'warning');
      return;
    }
    if (!this.isAllocationExempt() && this.allocations.length === 0) {
      Swal.fire('Validation', 'Please select at least one outstanding reference', 'warning');
      return;
    }

    const formData = this.paymentForm.getRawValue();
    const allocations = this.allocations.map(item => ({
      referenceType: item.referenceType,
      referenceId: Number(item.referenceId),
      allocatedAmount: Number(item.allocatedAmount || 0),
      discountAmount: Number(item.discountAmount || 0),
      writeOffAmount: Number(item.writeOffAmount || 0)
    }));
    const payment: Payment = {
      ...formData,
      partyId: formData.partyId ? Number(formData.partyId) : undefined,
      referenceId: formData.referenceId ? Number(formData.referenceId) : allocations[0]?.referenceId,
      accountId: formData.accountId ? Number(formData.accountId) : undefined,
      destinationAccountId: formData.destinationAccountId ? Number(formData.destinationAccountId) : undefined,
      amount: Number(formData.requestedAmount),
      requestedAmount: Number(formData.requestedAmount),
      receivedAmount: formData.receivedAmount ? Number(formData.receivedAmount) : undefined,
      changeAmount: formData.changeAmount ? Number(formData.changeAmount) : undefined,
      allocations
    };

    this.loading = true;

    const request = this.isEdit && this.paymentId
      ? this.paymentService.update(this.paymentId, payment)
      : this.paymentService.create(payment, submit);

    request.subscribe({
      next: () => {
        Swal.fire('Success', submit ? 'Payment request submitted for approval' : `Payment ${this.isEdit ? 'updated' : 'saved as draft'}`, 'success');
        this.router.navigate(['/payments']);
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', err.error?.message || 'Operation failed', 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/payments']);
  }

  calculateChangeAmount(): void {
    const requested = Number(this.paymentForm.get('requestedAmount')?.value || 0);
    const received = Number(this.paymentForm.get('receivedAmount')?.value || 0);
    const change = received > requested ? received - requested : 0;
    const control = this.paymentForm.get('changeAmount');
    if (control && Number(control.value || 0) !== change) {
      control.setValue(change ? change.toFixed(2) : '', { emitEvent: false });
    }
  }

  isMethod(...methods: string[]): boolean {
    return methods.includes(this.paymentForm.get('paymentMethod')?.value);
  }

  formatCurrency(amount: number): string {
    return '৳' + Number(amount || 0).toLocaleString('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
