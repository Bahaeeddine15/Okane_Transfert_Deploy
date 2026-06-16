import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Corridor } from '../services/corridors.service';
import { CountryService } from '../../../shared/services/country.service';

@Component({
  selector: 'app-corridors-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Source country</label>
        <select formControlName="sourceCountryId">
          <option value="">Select...</option>
          <option *ngFor="let country of countries" [value]="country.id">{{ country.name }}</option>
        </select>
        <span *ngIf="form.get('sourceCountryId')?.hasError('required')">Required</span>
      </div>

      <div class="form-group">
        <label>Destination country</label>
        <select formControlName="destinationCountryId">
          <option value="">Select...</option>
          <option *ngFor="let country of countries" [value]="country.id">{{ country.name }}</option>
        </select>
        <span *ngIf="form.get('destinationCountryId')?.hasError('required')">Required</span>
      </div>

      <div class="form-group">
        <label>Fixed fees</label>
        <input type="number" formControlName="fixedCost" step="0.01" />
        <span *ngIf="form.get('fixedCost')?.hasError('min')">Value cannot be negative</span>
      </div>

      <div class="form-group checkbox-row">
        <label>
          <input type="checkbox" formControlName="active" />
          Active
        </label>
      </div>

      <button type="submit" [disabled]="!form.valid">{{ corridor ? 'Update' : 'Create' }}</button>
    </form>
  `,
  styles: [`
    form { display: grid; gap: 16px; }
    .form-group { display: grid; gap: 6px; }
    label { color: #334155; font-weight: 700; }
    select, input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; box-sizing: border-box; }
    select:focus, input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
    .checkbox-row label { display: flex; align-items: center; gap: 8px; }
    .checkbox-row input { width: auto; }
    button { justify-self: start; padding: 11px 18px; background: #2563eb; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    span { color: #dc2626; font-size: 12px; }
  `]
})
export class CorridorsFormComponent implements OnInit {
  @Input() corridor: Corridor | null = null;
  @Output() submit = new EventEmitter<any>();
  form: FormGroup;
  countries: any[] = [];

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService
  ) {
    this.form = this.fb.group({
      sourceCountryId: ['', Validators.required],
      destinationCountryId: ['', Validators.required],
      active: [true],
      fixedCost: [0, Validators.min(0)]
    });
  }

  ngOnInit() {
    this.loadCountries();
    if (this.corridor) {
      this.form.patchValue(this.corridor);
    }
  }

  loadCountries() {
    this.countryService.getAll().subscribe(data => {
      this.countries = data;
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    }
  }
}
