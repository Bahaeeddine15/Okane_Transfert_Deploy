// frontend/src/app/admin/fees/services/fees.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/utils/constants';

export interface PricingGrid {
  id?: number;
  corridorId: number;
  amountMin: number;
  amountMax: number;
  percentageFee: number;
  active: boolean;
  sourceCountry?: string;
  destinationCountry?: string;
}

@Injectable({ providedIn: 'root' })
export class FeesService {
  private baseUrl = `${API_BASE_URL}/pricing-grids`;

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<PricingGrid[]>(this.baseUrl); }
  getByCorridor(corridorId: number) { return this.http.get<PricingGrid[]>(`${this.baseUrl}?corridorId=${corridorId}`); }
  getById(id: number) { return this.http.get<PricingGrid>(`${this.baseUrl}/${id}`); }
  create(data: PricingGrid) { return this.http.post<PricingGrid>(this.baseUrl, data); }
  update(id: number, data: PricingGrid) { return this.http.put<PricingGrid>(`${this.baseUrl}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.baseUrl}/${id}`); }
  toggleStatus(id: number, active: boolean) {
    return this.http.patch<PricingGrid>(`${this.baseUrl}/${id}/status`, { active });
  }
}
