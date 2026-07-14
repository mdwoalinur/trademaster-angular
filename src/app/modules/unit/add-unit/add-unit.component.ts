import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitService } from 'src/app/services/unit.service';
import { Unit } from 'src/app/models/unit.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-add-unit',
  templateUrl: './add-unit.component.html',
  styleUrls: ['./add-unit.component.css']
})
export class AddUnitComponent implements OnInit {
  unit: Unit = new Unit();
  isEdit = false;
  loading = false;

  unitTypes = ['WEIGHT', 'LENGTH', 'VOLUME', 'PIECE', 'TIME', 'OTHER'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private unitService: UnitService,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.isEdit = true;
        this.loadUnit(id);
      }
    }
  }

  loadUnit(id: number): void {
    this.loading = true;
    this.unitService.getUnitById(id).subscribe({
      next: (data) => {
        this.unit = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/units']);
      }
    });
  }

  save(): void {
    if (!this.unit.unitCode || !this.unit.unitName) {
      this.alert.warning('ALERT.VALIDATION.UNIT_REQUIRED');
      return;
    }

    this.loading = true;

    if (this.isEdit) {
      if (!this.unit.unitId) {
        this.alert.error(null, 'ALERT.MISSING_UPDATE_ID');
        this.loading = false;
        return;
      }
      this.unitService.updateUnit(this.unit.unitId, this.unit).subscribe({
        next: () => this.router.navigate(['/units']),
        error: (err) => this.handleError(err)
      });
    } else {
      this.unitService.createUnit(this.unit).subscribe({
        next: () => this.router.navigate(['/units']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    console.error(err);
    this.alert.error(err);
    this.loading = false;
  }

  cancel(): void {
    this.router.navigate(['/units']);
  }
}
