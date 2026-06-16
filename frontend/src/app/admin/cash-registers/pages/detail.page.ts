import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CashRegister, CashRegisterService } from '../../../core/services/cash-register.service';

@Component({
  selector: 'app-admin-cash-register-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.css',
})
export class AdminCashRegisterDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private cashRegisterService = inject(CashRegisterService);

  cashRegister: CashRegister | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cashRegisterService.getById(id).subscribe({
      next: (cashRegister) => {
        this.cashRegister = cashRegister;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.readError(error, 'Unable to load cash register details.');
        this.isLoading = false;
      },
    });
  }

  closeCashRegister(): void {
    if (!this.cashRegister) return;
    if (!confirm('Fermer cette caisse ? Le budget sera redistribué aux autres caisses actives de l\'agence.')) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cashRegisterService.closeById(this.cashRegister.id).subscribe({
      next: () => {
        this.successMessage = 'Caisse fermée avec succès.';
        this.loadDetails();
      },
      error: (error) => {
        this.errorMessage = this.readError(error, 'Impossible de fermer la caisse.');
        this.isLoading = false;
      },
    });
  }

  reopenCashRegister(): void {
    if (!this.cashRegister) return;
    if (!confirm('Réouvrir cette caisse ? Le budget sera redistribué entre toutes les caisses actives.')) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cashRegisterService.reopen(this.cashRegister.id).subscribe({
      next: () => {
        this.successMessage = 'Caisse réouverte avec succès.';
        this.loadDetails();
      },
      error: (error) => {
        this.errorMessage = this.readError(error, 'Impossible de réouvrir la caisse.');
        this.isLoading = false;
      },
    });
  }

  private readError(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error && 'error' in error) {
      const payload = (error as { error?: { message?: string } | string }).error;
      if (typeof payload === 'string') return payload;
      if (payload?.message) return payload.message;
    }

    return fallback;
  }
}
