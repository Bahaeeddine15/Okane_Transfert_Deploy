// frontend/src/app/admin/currencies/services/currencies.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/utils/constants';

export interface Currency {
  id?: number;
  code: string;
  name: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class CurrenciesService {
  private baseUrl = `${API_BASE_URL}/admin/currencies`;

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Currency[]>(this.baseUrl); }
  getById(id: number) { return this.http.get<Currency>(`${this.baseUrl}/${id}`); }
  create(data: Currency) { return this.http.post<Currency>(this.baseUrl, data); }
  update(id: number, data: Currency) { return this.http.put<Currency>(`${this.baseUrl}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.baseUrl}/${id}`); }
}
