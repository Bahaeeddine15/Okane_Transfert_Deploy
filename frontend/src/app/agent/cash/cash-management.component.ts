import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/utils/constants';

interface Movement { type: string; amount: number; }

interface CashRegisterDTO {
  id: number;
  date: string;
  openingBalance: number;
  closingBalance: number | null;
  closed: boolean;
  agent: { id: number; agentCode: string } | null;
  agency: { id: number; name: string } | null;
  movements: Movement[] | null;
}

@Component({
  selector: 'app-cash-management-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cash-management.component.html',
  styleUrl: './cash-management.component.css'
})
export class CashManagementComponent implements OnInit {

  cashRegister: CashRegisterDTO | null = null;
  loading = false;
  actionLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cashRegister = null;

    this.http.get<CashRegisterDTO[]>(`${API_BASE_URL}/agents/cash-registers/mine`).subscribe({
      next: registers => {
        this.cashRegister =
          registers.find(r => !r.closed) ??
          (registers.length > 0 ? registers[registers.length - 1] : null);
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Impossible de charger la caisse.';
        this.loading = false;
      }
    });
  }

  get balance(): number {
    if (!this.cashRegister) return 0;
    const base = Number(this.cashRegister.openingBalance) || 0;
    return (this.cashRegister.movements ?? []).reduce((sum, m) => {
      const t = String(m.type ?? '').toUpperCase();
      if (t === 'SENDING') return sum + Number(m.amount);
      if (t === 'PAYOUT')  return sum - Number(m.amount);
      return sum;
    }, base);
  }

  get isClosed(): boolean {
    return this.cashRegister?.closed === true;
  }

  closeCash(): void {
    if (!this.cashRegister || this.actionLoading) return;
    this.actionLoading = true;
    this.errorMessage = '';

    this.http.patch<CashRegisterDTO>(
      `${API_BASE_URL}/agents/cash-registers/${this.cashRegister.id}/close`, {}
    ).subscribe({
      next: result => {
        this.cashRegister = { ...result, movements: result.movements ?? [] };
        this.successMessage = 'Caisse clôturée avec succès.';
        this.actionLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la clôture.';
        this.actionLoading = false;
      }
    });
  }

  openCash(): void {
    if (!this.cashRegister || this.actionLoading) return;
    this.actionLoading = true;
    this.errorMessage = '';

    this.http.patch<CashRegisterDTO>(
      `${API_BASE_URL}/agents/cash-registers/${this.cashRegister.id}/reopen`, {}
    ).subscribe({
      next: result => {
        this.cashRegister = { ...result, movements: result.movements ?? [] };
        this.successMessage = 'Caisse ouverte avec succès.';
        this.actionLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: err => {
        this.errorMessage = err?.error?.message ?? 'Erreur lors de la réouverture.';
        this.actionLoading = false;
      }
    });
  }
}
