import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/utils/constants';

export interface Country {
  id: number;
  name: string;
  code?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private baseUrl = `${API_BASE_URL}/countries`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Country[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.http.get<Country>(`${this.baseUrl}/${id}`);
  }
}
