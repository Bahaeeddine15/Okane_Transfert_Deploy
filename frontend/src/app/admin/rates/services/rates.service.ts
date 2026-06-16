import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/utils/constants';

export interface ExchangeRate {
  id: number;
  currencyFrom: string;
  currencyTo: string;
  rate: number;
  updatedAt: string;
}

export interface Currency {
  id?: number;
  code: string;
  name: string;
  active: boolean;
  exchangeRate: number;
}

@Injectable({ providedIn: 'root' })
export class RatesService {
  private ratesUrl = `${API_BASE_URL}/admin/rates`;
  private currenciesUrl = `${API_BASE_URL}/admin/currencies`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ExchangeRate[]>(this.ratesUrl);
  }

  getById(id: number) {
    return this.http.get<Currency>(`${this.currenciesUrl}/${id}`);
  }

  create(data: Currency) {
    return this.http.post<Currency>(this.currenciesUrl, data);
  }

  update(id: number, data: Currency) {
    return this.http.put<Currency>(`${this.currenciesUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.currenciesUrl}/${id}`);
  }
}
