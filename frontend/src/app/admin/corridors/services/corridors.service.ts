// frontend/src/app/admin/corridors/services/corridors.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/utils/constants';

export interface Corridor {
  id?: number;
  sourceCountryId: number;
  destinationCountryId: number;
  sourceCountryName?: string;
  destinationCountryName?: string;
  active: boolean;
  fixedCost: number;
}

@Injectable({ providedIn: 'root' })
export class CorridorsService {
  private baseUrl = `${API_BASE_URL}/corridors`;

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Corridor[]>(this.baseUrl); }
  getById(id: number) { return this.http.get<Corridor>(`${this.baseUrl}/${id}`); }
  create(data: Corridor) { return this.http.post<Corridor>(this.baseUrl, data); }
  toggleStatus(id: number, active: boolean) {
    return this.http.patch<Corridor>(`${this.baseUrl}/${id}/status`, { active });
  }
  update(id: number, data: Corridor) { return this.http.put<Corridor>(`${this.baseUrl}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.baseUrl}/${id}`); }
}
