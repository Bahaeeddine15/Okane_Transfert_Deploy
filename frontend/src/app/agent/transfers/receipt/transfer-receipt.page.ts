import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TransferService } from '../services/transfer';
import { TransferResponse } from '../models/transfer-response';

@Component({
  selector: 'app-transfer-receipt-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './transfer-receipt.page.html',
  styleUrl: './transfer-receipt.page.css'
})
export class TransferReceiptPage implements OnInit {

  transfer?: TransferResponse;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private transferService: TransferService
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    const created = this.route.snapshot.queryParamMap.get('created');

    if (created === 'true') {
      this.successMessage = 'Transfer created successfully.';
    }

    if (!code) {
      this.errorMessage = 'Payout code missing';
      return;
    }

    this.transferService.getByCode(code).subscribe({
      next: (data) => this.transfer = data,
      error: (err) => this.errorMessage = err.error?.message || 'Unable to load receipt'
    });
  }

  printReceipt(): void {
    window.print();
  }

  downloadPdf(): void {
    if (!this.transfer) return;

    const lines = this.receiptLines(this.transfer);
    const content = this.buildPdfContent(lines);
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${this.transfer.payoutCode}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
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

  private receiptLines(transfer: TransferResponse): string[] {
    return [
      'Okane Transfert - Receipt',
      `Sender: ${transfer.senderName} - CIN: ${transfer.senderCin}`,
      `Beneficiary: ${transfer.beneficiaryName} - CIN: ${transfer.beneficiaryCin}`,
      `Payout Code: ${transfer.payoutCode}`,
      `Sent Date: ${this.formatTransferDate(transfer.createdAt)}`,
      `Expiration Date: ${this.formatTransferDate(transfer.expiredAt)}`,
      `Sent Amount: ${transfer.sentAmount} ${transfer.sendingCurrency}`,
      `Exchange Rate: 1 ${transfer.sendingCurrency.toUpperCase()} = ${transfer.appliedRate} ${transfer.receivedCurrency.toUpperCase()}`,
      `Fees: ${transfer.cost} ${transfer.sendingCurrency}`,
      `Received Amount: ${transfer.receivedAmount} ${transfer.receivedCurrency}`,
      `Corridor: ${transfer.corridorLabel || '-'}`
    ];
  }

  private buildPdfContent(lines: string[]): string {
    const objects: string[] = [];
    const text = lines
      .map((line, index) => `BT /F1 12 Tf 50 ${760 - index * 24} Td (${this.escapePdf(line)}) Tj ET`)
      .join('\n');

    objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
    objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
    objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj');
    objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
    objects.push(`5 0 obj << /Length ${text.length} >> stream\n${text}\nendstream endobj`);

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object) => {
      offsets.push(pdf.length);
      pdf += `${object}\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return pdf;
  }

  private escapePdf(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
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
