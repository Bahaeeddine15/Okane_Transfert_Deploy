import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/utils/constants';

export interface Country {
  id: number;
  name: string;
  isoCode?: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/countries`;

  getAll(): Observable<Country[]> {
    return this.http.get<Country[]>(this.baseUrl);
  }
}
