import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TransferService } from '../services/transfer';
import { TransferResponse } from '../models/transfer-response';

@Component({
  selector: 'app-transfer-details-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transfer-details.page.html',
  styleUrl: './transfer-details.page.css'
})
export class TransferDetailsPage implements OnInit {

  transfer?: TransferResponse;

  constructor(
    private route: ActivatedRoute,
    private transferService: TransferService
  ) {}

  ngOnInit(): void {

    const code = this.route.snapshot.paramMap.get('code');

    if (!code) return;

    this.transferService.getByCode(code).subscribe({
      next: (data) => {
        this.transfer = data;
      }
    });
  }

  formatTransferDate(value: string | number[] | null | undefined): string {
    const date = this.toDate(value);

    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date);
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
}
