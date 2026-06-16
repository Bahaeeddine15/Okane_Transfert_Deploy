import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { CurrenciesService, Currency } from '../../services/currencies.service';

@Component({
  selector: 'app-admin-devises-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="currencies-page">
      <header class="page-header">
        <div>
          <h2>Currencies</h2>
          <p>Data is automatically synchronized from the database.</p>
        </div>

        <div class="refresh-state" [class.refreshing]="refreshing">
          <span class="state-dot"></span>
          <span *ngIf="lastRefresh; else waiting">
            Last refresh {{ lastRefresh | date:'HH:mm:ss' }}
          </span>
          <ng-template #waiting>Reading data</ng-template>
        </div>
      </header>

      <div *ngIf="error" class="alert">{{ error }}</div>

      <div *ngIf="loading" class="placeholder">
        Loading currencies...
      </div>

      <div *ngIf="!loading && !currencies.length && !error" class="placeholder">
        No currencies available.
      </div>

      <div *ngIf="!loading && currencies.length" class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let currency of currencies; trackBy: trackByCurrencyId">
              <td><span class="currency-code">{{ currency.code }}</span></td>
              <td>{{ currency.name }}</td>
              <td>
                <span class="status-pill" [class.inactive]="!currency.active">
                  {{ currency.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .currencies-page { display: grid; gap: 18px; }
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 18px 20px;
    }
    .page-header h2 { margin: 0; font-size: 22px; color: #0f172a; }
    .page-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .refresh-state {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border: 1px solid #dbe3ef;
      border-radius: 10px;
      color: #475569;
      font-size: 13px;
      white-space: nowrap;
    }
    .state-dot { width: 8px; height: 8px; border-radius: 999px; background: #16a34a; }
    .refresh-state.refreshing .state-dot { background: #2563eb; }
    .alert, .placeholder {
      border-radius: 12px;
      padding: 14px 16px;
      background: #fff;
      border: 1px solid #e5e7eb;
      color: #475569;
    }
    .alert { border-color: #fecaca; background: #fff1f2; color: #be123c; }
    .table-shell { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
    .data-table { width: 100%; min-width: 640px; border-collapse: collapse; }
    .data-table th {
      text-align: left; font-weight: 700; padding: 12px 14px;
      border-bottom: 1px solid #e5e7eb; color: #0f172a; background: #f8fafc;
    }
    .data-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .data-table tbody tr:last-child td { border-bottom: 0; }
    .currency-code {
      display: inline-flex; min-width: 48px; justify-content: center;
      padding: 4px 8px; border-radius: 6px;
      background: #eef2ff; color: #3730a3; font-weight: 700; text-transform: uppercase;
    }
    .status-pill {
      display: inline-flex; padding: 4px 9px; border-radius: 999px;
      background: #ecfdf5; color: #047857; font-size: 13px; font-weight: 700;
    }
    .status-pill.inactive { background: #f1f5f9; color: #64748b; }
    @media (max-width: 720px) {
      .page-header { display: grid; }
      .refresh-state { width: max-content; max-width: 100%; }
    }
  `],
})
export class DevisesPage implements OnInit, OnDestroy {
  currencies: Currency[] = [];
  loading = true;
  refreshing = false;
  error: string | null = null;
  lastRefresh: Date | null = null;

  private currenciesSubscription?: Subscription;

  constructor(private currenciesService: CurrenciesService) {}

  ngOnInit(): void {
    this.currenciesSubscription = timer(0, 10000)
      .pipe(switchMap(() => {
        this.refreshing = !this.loading;
        return this.currenciesService.getAll();
      }))
      .subscribe({
        next: (data) => {
          this.currencies = data;
          this.loading = false;
          this.refreshing = false;
          this.error = null;
          this.lastRefresh = new Date();
        },
        error: (err) => {
          this.error = 'Unable to load currencies right now.';
          this.loading = false;
          this.refreshing = false;
          console.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.currenciesSubscription?.unsubscribe();
  }

  trackByCurrencyId(_: number, currency: Currency): number | undefined {
    return currency.id;
  }
}
