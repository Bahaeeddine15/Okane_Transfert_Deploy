import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { timeout, catchError, of } from 'rxjs';

import { TransferService } from '../services/transfer';
import { TransferResponse } from '../models/transfer-response';

type TransferStatus = 'ALL' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED';

@Component({
  selector: 'app-transfer-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transfer-history.page.html',
  styleUrl: './transfer-history.page.css'
})
export class TransferHistoryPage implements OnInit {

  transfers: TransferResponse[] = [];
  searchTerm = '';
  statusFilter: TransferStatus = 'ALL';

  loading = false;
  successMessage = '';
  errorMessage = '';

  readonly statusOptions: { value: TransferStatus; label: string }[] = [
    { value: 'ALL',      label: 'All' },
    { value: 'PENDING',  label: 'Pending' },
    { value: 'PAID',     label: 'Paid' },
    { value: 'EXPIRED',  label: 'Expired' },
    { value: 'CANCELED', label: 'Canceled' },
  ];

  constructor(private transferService: TransferService) {}

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.transferService.getAgentTransfers().pipe(
      timeout(8000),
      catchError(() => of([] as TransferResponse[]))
    ).subscribe(data => {
      this.transfers = this.sortByNewest(data);
      this.loading = false;
    });
  }

  setStatusFilter(status: TransferStatus): void {
    this.statusFilter = status;
    this.searchTerm = '';
  }

  trackByIndex(index: number): number {
    return index;
  }

  get filteredTransfers(): TransferResponse[] {
    let result = this.transfers;

    // Filter by status
    if (this.statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === this.statusFilter);
    }

    // Filter by search term
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((t) =>
        t.payoutCode?.toLowerCase().includes(term)
      );
    }

    return result;
  }

  formatTransferDate(value: string | number[] | null | undefined): string {
    const date = this.toDate(value);

    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private sortByNewest(transfers: TransferResponse[]): TransferResponse[] {
    return [...transfers].sort((a, b) => {
      return this.getDateTime(b.createdAt) - this.getDateTime(a.createdAt);
    });
  }

  private getDateTime(value: string | number[] | null | undefined): number {
    return this.toDate(value)?.getTime() ?? 0;
  }

  private toDate(value: string | number[] | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    if (Array.isArray(value)) {
      const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = value;
      return new Date(year, month - 1, day, hour, minute, second);
    }

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  cancelTransfer(id: number): void {
    if (!confirm('Cancel this transfer ?')) return;

    this.transferService.cancelTransfer(id).pipe(
      timeout(5000),
      catchError(() => of(null))
    ).subscribe({
      next: () => {
        this.successMessage = 'Transfer canceled successfully';
        this.loadTransfers();

        setTimeout(() => {
          this.successMessage = '';
        }, 2500);
      },
      error: () => {
        this.errorMessage = 'Unable to cancel transfer';

        setTimeout(() => {
          this.errorMessage = '';
        }, 2500);
      }
    });
  }

}