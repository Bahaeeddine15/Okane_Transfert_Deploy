import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TransferService } from '../services/transfer';
import { CurrencyService } from '../../../shared/services/currency.service';
import { Corridor, CorridorsService } from '../../../admin/corridors/services/corridors.service';

import { TransferRequest } from '../models/transfer-request';
import { Currency } from '../../../shared/models/currency';

@Component({
  selector: 'app-transfer-create-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-create.page.html',
  styleUrl: './transfer-create.page.css'
})
export class TransferCreatePage implements OnInit {

  currencies: Currency[] = [];
  corridors: Corridor[] = [];

  loading = false;
  successMessage = '';
  errorMessage = '';

  form: TransferRequest = this.getEmptyForm();

  // Searchable dropdowns state
  sendingSearch  = '';
  receivingSearch = '';
  sendingOpen    = false;
  receivingOpen  = false;

  get filteredSending(): Currency[] {
    const t = this.sendingSearch.toLowerCase();
    return t ? this.currencies.filter(c => c.code.toLowerCase().includes(t) || c.name?.toLowerCase().includes(t)) : this.currencies;
  }

  get filteredReceiving(): Currency[] {
    const t = this.receivingSearch.toLowerCase();
    return t ? this.currencies.filter(c => c.code.toLowerCase().includes(t) || c.name?.toLowerCase().includes(t)) : this.currencies;
  }

  labelOf(id: number | null): string {
    const c = this.currencies.find(x => x.id === id);
    return c ? `${c.code.toUpperCase()} — ${c.name}` : 'Select currency';
  }

  selectSending(c: Currency) {
    this.form.sendingCurrencyId = c.id;
    this.sendingSearch = '';
    this.sendingOpen   = false;
  }

  selectReceiving(c: Currency) {
    this.form.receivedCurrencyId = c.id;
    this.receivingSearch = '';
    this.receivingOpen   = false;
  }

  closeDropdowns() {
    this.sendingOpen = false;
    this.receivingOpen = false;
  }

  constructor(
    private transferService: TransferService,
    private currencyService: CurrencyService,
    private corridorsService: CorridorsService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.sendingOpen = false;
      this.receivingOpen = false;
    }
  }

  ngOnInit() {
    this.loadCurrencies();
    this.loadCorridors();
  }

  loadCurrencies() {
    this.currencyService.getAllCurrencies().subscribe({
      next: (data) => this.currencies = data,
      error: (err) => console.error('Currencies load error', err)
    });
  }

  loadCorridors() {
    this.corridorsService.getAll().subscribe({
      next: (data: Corridor[]) => this.corridors = data.filter((c: Corridor) => c.active),
      error: (err: any) => console.error('Corridors load error', err)
    });
  }

  submit() {
    this.successMessage = '';
    this.errorMessage = '';

    const senderCin = this.form.senderCin.trim();
    const beneficiaryCin = this.form.beneficiaryCin.trim();

    if (!senderCin || !beneficiaryCin) {
      this.errorMessage = 'Sender CIN and beneficiary CIN are required';
      return;
    }

    if (senderCin.toLowerCase() === beneficiaryCin.toLowerCase()) {
      this.errorMessage = 'Sender and beneficiary cannot be the same';
      return;
    }

    if (!this.form.sentAmount || this.form.sentAmount <= 0) {
      this.errorMessage = 'Amount must be greater than 0';
      return;
    }

    if (!this.form.sendingCurrencyId || !this.form.receivedCurrencyId || !this.form.corridorId) {
      this.errorMessage = 'Currency and corridor fields are required';
      return;
    }

    this.loading = true;

    this.transferService.createTransfer({
      ...this.form,
      senderCin,
      beneficiaryCin
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/agent/transfers/receipt', res.payoutCode], {
          queryParams: { created: 'true' }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Unexpected error occurred';
      }
    });
  }

  private getEmptyForm(): TransferRequest {
    return {
      senderCin: '',
      beneficiaryCin: '',
      sentAmount: null as unknown as number,
      sendingCurrencyId: null as unknown as number,
      receivedCurrencyId: null as unknown as number,
      corridorId: null as unknown as number,
      payoutMethod: 'CASH'
    };
  }
}