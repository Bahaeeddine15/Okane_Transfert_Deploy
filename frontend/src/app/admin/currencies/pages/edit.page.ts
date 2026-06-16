import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrenciesFormComponent } from '../components/form.component';
import { CurrenciesService, Currency } from '../services/currencies.service';

@Component({
  selector: 'app-admin-currencies-edit-page',
  standalone: true,
  imports: [CommonModule, CurrenciesFormComponent],
  templateUrl: './edit.page.html'
})
export class CurrenciesEditPage implements OnInit {
  currency: Currency | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private currenciesService: CurrenciesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currenciesService.getById(+id).subscribe({
        next: (data) => {
          this.currency = data;
          this.loading = false;
        },
        error: () => {
          alert('Unable to load the currency');
          this.router.navigate(['/admin/currencies']);
        }
      });
    }
  }

  onSubmit(data: any) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.currenciesService.update(+id, data).subscribe({
        next: () => {
          alert('Currency updated successfully');
          this.router.navigate(['/admin/currencies']);
        },
        error: (err) => {
          alert('Unable to update the currency');
          console.error(err);
        }
      });
    }
  }
}
