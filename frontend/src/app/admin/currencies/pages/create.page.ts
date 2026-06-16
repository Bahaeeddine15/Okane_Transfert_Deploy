import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CurrenciesFormComponent } from '../components/form.component';
import { CurrenciesService } from '../services/currencies.service';

@Component({
  selector: 'app-admin-currencies-create-page',
  standalone: true,
  imports: [CommonModule, CurrenciesFormComponent],
  templateUrl: './create.page.html'
})
export class CurrenciesCreatePage {
  constructor(
    private currenciesService: CurrenciesService,
    private router: Router
  ) {}

  onSubmit(data: any) {
    this.currenciesService.create(data).subscribe({
      next: () => {
        alert('Currency created successfully');
        this.router.navigate(['/admin/currencies']);
      },
      error: (err) => {
        alert('Unable to create the currency');
        console.error(err);
      }
    });
  }
}
