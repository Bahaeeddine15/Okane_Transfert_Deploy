import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RatesFormComponent } from '../components/form.component';
import { RatesService, Currency } from '../services/rates.service';

@Component({
  selector: 'app-admin-rates-edit-page',
  standalone: true,
  imports: [CommonModule, RatesFormComponent],
  template: `
    <section class="panel">
      <div class="row">
        <h2>Edit exchange rate</h2>
      </div>
      <ng-container *ngIf="rate">
        <app-rates-form [rate]="rate" (submit)="onSubmit($event)"></app-rates-form>
      </ng-container>
    </section>
  `
})
export class RatesEditPage implements OnInit {
  rate: Currency | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ratesService: RatesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ratesService.getById(+id).subscribe({
        next: (data) => {
          this.rate = data;
          this.loading = false;
        },
        error: () => {
          alert('Unable to load the exchange rate');
          this.router.navigate(['/admin/rates']);
        }
      });
    }
  }

  onSubmit(data: any) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ratesService.update(+id, data).subscribe({
        next: () => {
          alert('Exchange rate updated successfully');
          this.router.navigate(['/admin/rates']);
        },
        error: (err) => {
          alert('Unable to update the exchange rate');
          console.error(err);
        }
      });
    }
  }
}
