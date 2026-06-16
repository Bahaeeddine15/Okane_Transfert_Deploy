import { Injectable } from '@angular/core';
import { Api } from '../../core/services/api';
import { Currency } from '../models/currency';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(private api: Api) {}

  getAllCurrencies() {
    return this.api.get<Currency[]>('/currencies');
  }
}