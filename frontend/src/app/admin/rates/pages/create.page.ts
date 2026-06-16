import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RatesFormComponent } from '../components/form.component';
import { RatesService } from '../services/rates.service';

@Component({
  selector: 'app-admin-rates-create-page',
  standalone: true,
  imports: [CommonModule, RatesFormComponent],
  template: `
    <section class="panel">
      <div class="row">
        <h2>Create exchange rate</h2>
      </div>
      <app-rates-form (submit)="onSubmit($event)"></app-rates-form>
    </section>
  `
})
export class RatesCreatePage {
  constructor(
    private ratesService: RatesService,
    private router: Router
  ) {}

  onSubmit(data: any) {
    this.ratesService.create(data).subscribe({
      next: () => {
        alert('Exchange rate created successfully');
        this.router.navigate(['/admin/rates']);
      },
      error: (err) => {
        alert('Unable to create the exchange rate');
        console.error(err);
      }
    });
  }
}
