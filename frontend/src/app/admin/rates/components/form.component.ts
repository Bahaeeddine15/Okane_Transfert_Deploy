import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Currency } from '../services/rates.service';

@Component({
  selector: 'app-rates-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Code (3 characters)</label>
        <input type="text" formControlName="code" maxlength="3" />
        <span *ngIf="form.get('code')?.hasError('required')">Required</span>
      </div>

      <div class="form-group">
        <label>Name</label>
        <input type="text" formControlName="name" />
        <span *ngIf="form.get('name')?.hasError('required')">Required</span>
      </div>

      <div class="form-group">
        <label>Exchange rate</label>
        <input type="number" formControlName="exchangeRate" step="0.01" />
        <span *ngIf="form.get('exchangeRate')?.hasError('required')">Required</span>
      </div>

      <div class="form-group checkbox-row">
        <label>
          <input type="checkbox" formControlName="active" />
          Active
        </label>
      </div>

      <button type="submit" [disabled]="!form.valid">{{ rate ? 'Update' : 'Create' }}</button>
    </form>
  `,
  styles: [`
    form { display: grid; gap: 16px; }
    .form-group { display: grid; gap: 6px; }
    label { color: #334155; font-weight: 700; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; box-sizing: border-box; }
    input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
    .checkbox-row label { display: flex; align-items: center; gap: 8px; }
    .checkbox-row input { width: auto; }
    button { justify-self: start; padding: 11px 18px; background: #2563eb; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    span { color: #dc2626; font-size: 12px; }
  `]
})
export class RatesFormComponent implements OnInit {
  @Input() rate: Currency | null = null;
  @Output() submit = new EventEmitter<any>();
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      name: ['', Validators.required],
      exchangeRate: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit() {
    if (this.rate) {
      this.form.patchValue(this.rate);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    }
  }
}
