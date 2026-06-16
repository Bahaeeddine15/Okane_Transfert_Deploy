import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransferService } from '../services/transfer';
import { TransferResponse } from '../models/transfer-response';
import { timeout, catchError, of, forkJoin } from 'rxjs';

type TransferStatus = 'ALL' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED';

@Component({
  selector: 'app-transfer-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-list.page.html',
  styleUrl: './transfer-list.page.css'
})
export class TransferListPage implements OnInit {

  sentTransfers: TransferResponse[] = [];
  receivedTransfers: TransferResponse[] = [];
  activeView: 'sent' | 'received' = 'sent';
  searchTerm = '';
  statusFilter: TransferStatus = 'ALL';
  loading = false;
  errorMessage = '';

  readonly statusOptions: { value: TransferStatus; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELED', label: 'Canceled' },
  ];

  constructor(
    private transferService: TransferService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      sent: this.transferService.getSentTransfers().pipe(timeout(5000), catchError(() => of([] as TransferResponse[]))),
      received: this.transferService.getReceivedTransfers().pipe(timeout(5000), catchError(() => of([] as TransferResponse[])))
    }).subscribe(({ sent, received }) => {
      this.sentTransfers = this.sortByNewest(sent, 'createdAt');
      this.receivedTransfers = this.sortByNewest(received, 'paidAt');
      this.loading = false;
    });
  }

  setActiveView(view: 'sent' | 'received') {
    this.activeView = view;
    this.searchTerm = '';
    this.statusFilter = 'ALL';
  }

  setStatusFilter(status: TransferStatus): void {
    this.statusFilter = status;
    this.searchTerm = '';
  }

  trackByIndex(index: number): number {
    return index;
  }

  get currentTransfers(): TransferResponse[] {
    return this.activeView === 'sent' ? this.sentTransfers : this.receivedTransfers;
  }

  get filteredTransfers(): TransferResponse[] {
    let result = this.currentTransfers;

    if (this.activeView === 'sent' && this.statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === this.statusFilter);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((t) => t.payoutCode?.toLowerCase().includes(term));
    }

    return result;
  }

  get hasTransfers(): boolean {
    return this.sentTransfers.length > 0 || this.receivedTransfers.length > 0;
  }

  transferAmount(transfer: TransferResponse): string {
    if (this.activeView === 'received') {
      return `${transfer.receivedAmount} ${transfer.receivedCurrency}`;
    }

    return `${transfer.sentAmount} ${transfer.sendingCurrency}`;
  }

  transferDate(transfer: TransferResponse): string {
    return this.formatTransferDate(this.activeView === 'received' ? transfer.paidAt : transfer.createdAt);
  }

  formatTransferDate(value: string | number[] | null | undefined): string {
    const date = this.toDate(value);

    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private sortByNewest(
    transfers: TransferResponse[],
    dateField: 'createdAt' | 'paidAt'
  ): TransferResponse[] {
    return [...transfers].sort((a, b) => {
      return this.getDateTime(b[dateField]) - this.getDateTime(a[dateField]);
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

  goDetails(code: string) {
    this.router.navigate(['/client/transfers/details', code]);
  }
}
