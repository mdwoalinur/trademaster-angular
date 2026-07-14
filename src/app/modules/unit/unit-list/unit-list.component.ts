import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UnitService } from 'src/app/services/unit.service';
import { Unit } from 'src/app/models/unit.model';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.css']
})
export class UnitListComponent implements OnInit {
  units: Unit[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  statusOptions = ['ALL', 'ACTIVE', 'INACTIVE'];

  constructor(
    private unitService: UnitService,
    private router: Router,
    private alert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading = true;
    this.unitService.getUnits().subscribe({
      next: (data) => {
        this.units = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading units:', err);
        this.loading = false;
      }
    });
  }

  get filteredUnits(): Unit[] {
    let filtered = this.units;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.unitName.toLowerCase().includes(term) ||
        u.unitCode.toLowerCase().includes(term)
      );
    }
    if (this.filterStatus !== 'ALL') {
      const active = this.filterStatus === 'ACTIVE';
      filtered = filtered.filter(u => u.status === active);
    }
    return filtered;
  }

  addUnit(): void {
    this.router.navigate(['/units/add']);
  }

  editUnit(unit: Unit): void {
    this.router.navigate(['/units/edit', unit.unitId]);
  }

  deleteUnit(unit: Unit): void {
    if (!unit.unitId) return;
    const unitId = unit.unitId;
    this.alert.delete('ALERT.ENTITY.UNIT', unit.unitName).then(result => {
      if (!result.isConfirmed) return;
      this.unitService.deleteUnit(unitId).subscribe({
        next: () => {
          this.loadUnits();
          this.alert.success('ALERT.DELETED_SUCCESS');
        },
        error: (err) => this.alert.error(err, 'ALERT.DELETE_FAILED')
      });
    });
  }

  getStatusClass(status: boolean): string {
    return status ? 'badge bg-success' : 'badge bg-secondary';
  }

  getStatusText(status: boolean): string {
    return status ? 'ACTIVE' : 'INACTIVE';
  }

  getUnitTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      WEIGHT: 'Weight',
      LENGTH: 'Length',
      VOLUME: 'Volume',
      PIECE: 'Piece',
      TIME: 'Time',
      OTHER: 'Other'
    };
    return labels[type] || type;
  }

  getUnitTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      PIECE: 'bi-grid-3x3-gap',
      WEIGHT: 'bi-speedometer2',
      VOLUME: 'bi-droplet',
      LENGTH: 'bi-rulers',
      TIME: 'bi-clock',
      OTHER: 'bi-tag'
    };
    return icons[type] || icons['OTHER'];
  }

  getBaseUnitLabel(unit: Unit): string {
    if (unit.isBase) {
      return '-';
    }
    const baseUnit = this.units.find(u => u.unitId === unit.baseUnitId);
    if (baseUnit) {
      return `${baseUnit.unitCode} - ${baseUnit.unitName}`;
    }
    return unit.baseUnitId ? `ID: ${unit.baseUnitId}` : '-';
  }

  getConversionText(unit: Unit): string {
    const factor = Number(unit.conversionFactor || 1);
    const baseUnit = unit.isBase ? 'Base Unit' : (this.units.find(u => u.unitId === unit.baseUnitId)?.unitCode || 'Base Unit');
    return `1 ${unit.unitCode || 'Unit'} = ${factor} ${baseUnit}`;
  }
}
