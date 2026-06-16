import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PricingGrid } from '../services/fees.service';
import { CorridorsService } from '../../corridors/services/corridors.service';

export function amountRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const min = control.get('amountMin')?.value;
    const max = control.get('amountMax')?.value;
    if (min !== null && max !== null && min !== '' && max !== '') {
      if (Number(min) >= Number(max)) {
        return { amountInvalid: true };
      }
    }
    return null;
  };
}

@Component({
  selector: 'app-fees-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Corridor</label>
        <select formControlName="corridorId">
          <option value="">Select...</option>
          <option *ngFor="let corridor of corridors" [value]="corridor.id">
            {{ corridor.sourceCountryName }} -> {{ corridor.destinationCountryName }}
          </option>
        </select>
        <span *ngIf="form.get('corridorId')?.invalid && form.get('corridorId')?.touched" class="field-error">Corridor is required</span>
      </div>

      <div class="form-group">
        <label>Minimum amount</label>
        <input type="number" formControlName="amountMin" step="0.01" min="0" />
        <span *ngIf="form.get('amountMin')?.hasError('min') && form.get('amountMin')?.touched" class="field-error">Must be positive</span>
      </div>

      <div class="form-group">
        <label>Maximum amount</label>
        <input type="number" formControlName="amountMax" step="0.01" min="0" />
        <span *ngIf="form.get('amountMax')?.hasError('required') && form.get('amountMax')?.touched" class="field-error">Required</span>
      </div>

      <div *ngIf="form.hasError('amountInvalid') && form.get('amountMax')?.touched" class="form-error">
        Minimum amount must be strictly lower than maximum amount.
      </div>

      <div class="form-group">
        <label>Fee (%)</label>
        <input type="number" formControlName="percentageFee" step="0.01" min="0" />
        <span *ngIf="form.get('percentageFee')?.hasError('min') && form.get('percentageFee')?.touched" class="field-error">Must be positive</span>
      </div>

      <button type="submit" [disabled]="form.invalid">{{ fee ? 'Update' : 'Create' }}</button>
    </form>
  `,
  styles: [`
    form { display: grid; gap: 16px; }
    .form-group { display: grid; gap: 6px; }
    label { color: #334155; font-weight: 700; }
    input, select { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; box-sizing: border-box; }
    input:focus, select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
    button { justify-self: start; padding: 11px 18px; background: #2563eb; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; }
    button:disabled { opacity: 0.5; cursor: not-allowed; background: #94a3b8; }
    .field-error { color: #dc2626; font-size: 12px; }
    .form-error { color: #991b1b; font-size: 13px; padding: 10px 12px; background: #fee2e2; border-radius: 10px; }
  `]
})
export class FeesFormComponent implements OnInit {
  @Input() fee: PricingGrid | null = null;
  @Output() submit = new EventEmitter<any>();
  form: FormGroup;
  corridors: any[] = [];

  constructor(
    private fb: FormBuilder,
    private corridorsService: CorridorsService
  ) {
    this.form = this.fb.group({
      corridorId: ['', Validators.required],
      amountMin: [0, [Validators.required, Validators.min(0)]],
      amountMax: ['', [Validators.required, Validators.min(0)]],
      percentageFee: [0, [Validators.required, Validators.min(0)]]
    }, { validators: amountRangeValidator() });
  }

  ngOnInit() {
    this.loadCorridors();
    if (this.fee) {
      this.form.patchValue(this.fee);
    }
  }

  loadCorridors() {
    this.corridorsService.getAll().subscribe(data => {
      this.corridors = data;
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    }
  }
}
