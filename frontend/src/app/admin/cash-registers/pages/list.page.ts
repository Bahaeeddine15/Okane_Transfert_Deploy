import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';

import { CashRegister, CashRegisterService } from '../../../core/services/cash-register.service';

@Component({
  selector: 'app-admin-cash-register-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './list.page.html',
  styleUrl: './list.page.css',
})
export class AdminCashRegisterListPage implements OnInit {
  private cashRegisterService = inject(CashRegisterService);
  private fb = inject(FormBuilder);
  private refresh$ = new BehaviorSubject<void>(undefined);

  isLoading = false;
  errorMessage = '';

  filters = this.fb.nonNullable.group({
    agency: [''],
    status: [''],
  });

  cashRegisters$ = this.refresh$.pipe(
    switchMap(() => {
      this.isLoading = true;
      this.errorMessage = '';
      return this.cashRegisterService.getAll().pipe(
        catchError((error) => {
          this.errorMessage = this.readError(error, 'Unable to load cash registers.');
          this.isLoading = false;
          return of([] as CashRegister[]);
        })
      );
    })
  );

  filteredCashRegisters$ = combineLatest([
    this.cashRegisters$,
    this.filters.valueChanges.pipe(startWith(this.filters.getRawValue())),
  ]).pipe(
    map(([cashRegisters, filters]) => {
      this.isLoading = false;
      const agency = (filters.agency || '').trim().toLowerCase();
      const status = filters.status || '';

      return cashRegisters.filter((cashRegister) => {
        const agencyMatches = !agency || cashRegister.agencyName.toLowerCase().includes(agency) || String(cashRegister.agencyId || '').includes(agency);
        const statusMatches = !status || cashRegister.status === status;
        return agencyMatches && statusMatches;
      });
    })
  );

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.refresh$.next();
  }

  private readError(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error && 'error' in error) {
      const payload = (error as { error?: { message?: string } | string; status?: number }).error;
      const status = (error as { status?: number }).status;

      if (status === 405) {
       return 'Invalid API endpoint or HTTP method (GET /api/cash-registers).';
      }

      if (typeof payload === 'string') {
        return payload.includes('<html') ? fallback : payload;
      }

      if (payload?.message) return payload.message;
    }

    return fallback;
  }
}
