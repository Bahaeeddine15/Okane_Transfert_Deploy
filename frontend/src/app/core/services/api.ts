import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);

  get<T>(url: string) {
    return this.http.get<T>(`${API_BASE_URL}${url}`);
  }

  post<T>(url: string, body: unknown) {
    return this.http.post<T>(`${API_BASE_URL}${url}`, body);
  }

  put<T>(url: string, body: unknown) {
    return this.http.put<T>(`${API_BASE_URL}${url}`, body);
  }

  delete<T>(url: string) {
    return this.http.delete<T>(`${API_BASE_URL}${url}`);
  }
}
