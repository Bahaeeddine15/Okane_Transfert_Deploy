import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../services/transfer';
import { TransferResponse } from '../models/transfer-response';

@Component({
  selector: 'app-transfer-receive-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './transfer-receive.page.html',
  styleUrl: './transfer-receive.page.css'
})
export class TransferReceivePage implements OnInit {

  payoutCode = '';
  loading = false;
  successMessage = '';
  errorMessage = '';
  paidTransfer?: TransferResponse;

  constructor(
    private transferService: TransferService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.payoutCode = this.route.snapshot.queryParamMap.get('code') || '';
  }

  pay(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.paidTransfer = undefined;

    const code = this.payoutCode.trim();
    if (!code) {
      this.errorMessage = 'Payout code is required.';
      return;
    }

    this.loading = true;

    this.transferService.payTransfer(code).subscribe({
      next: (transfer) => {
        this.ngZone.run(() => {
          this.paidTransfer = transfer;
          this.successMessage = 'Transfer paid successfully';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = err.error?.message || 'Unable to pay transfer';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  formatTransferDate(value: string | number[] | null | undefined): string {
    const date = this.toDate(value);

    if (!date) return '-';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private toDate(value: string | number[] | null | undefined): Date | null {
    if (!value) return null;

    if (Array.isArray(value)) {
      const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = value;
      return new Date(year, month - 1, day, hour, minute, second);
    }

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
  }
}
