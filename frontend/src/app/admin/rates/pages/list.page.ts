import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ExchangeRate, RatesService } from '../services/rates.service';

@Component({
  selector: 'app-admin-rates-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.page.html',
  styleUrl: './list.page.css',
})
export class RatesListPage implements OnInit, OnDestroy {
  rates: ExchangeRate[] = [];
  loading = true;
  refreshing = false;
  error: string | null = null;
  lastRefresh: Date | null = null;

  private ratesSubscription?: Subscription;

  constructor(private ratesService: RatesService) {}

  ngOnInit(): void {
    this.ratesSubscription = timer(0, 10000)
      .pipe(switchMap(() => {
        this.refreshing = !this.loading;
        return this.ratesService.getAll();
      }))
      .subscribe({
        next: (data) => {
          this.rates = data;
          this.loading = false;
          this.refreshing = false;
          this.error = null;
          this.lastRefresh = new Date();
        },
        error: (err) => {
          this.error = 'Impossible de charger les taux de change pour le moment.';
          this.loading = false;
          this.refreshing = false;
          console.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.ratesSubscription?.unsubscribe();
  }

  trackByRateId(_: number, rate: ExchangeRate): number {
    return rate.id;
  }
}
