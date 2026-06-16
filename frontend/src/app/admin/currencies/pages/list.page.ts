// frontend/src/app/admin/currencies/pages/list.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CurrenciesService, Currency } from '../services/currencies.service';

@Component({
  selector: 'app-admin-currencies-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.css']
})
export class CurrenciesListPage implements OnInit {
  currencies: Currency[] = [];
  loading = true;
  error: string | null = null;

  constructor(private currenciesService: CurrenciesService) {}

  ngOnInit() {
    this.loadCurrencies();
  }

  loadCurrencies() {
    this.loading = true;
    this.currenciesService.getAll().subscribe({
      next: (data) => {
        this.currencies = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des devises';
        this.loading = false;
        console.error(err);
      }
    });
  }

  delete(id: number | undefined) {
    if (!id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer cette devise ?')) {
      this.currenciesService.delete(id).subscribe({
        next: () => {
          this.currencies = this.currencies.filter(c => c.id !== id);
        },
        error: (err) => {
          alert('Erreur lors de la suppression');
          console.error(err);
        }
      });
    }
  }
}
