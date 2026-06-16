import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/utils/constants';
import { Agent } from '../../agents/services/agent.service';

export interface Agency {
  id: number;
  name: string;
  address: string;
  active: boolean;
  dailyLimit: number;
  countryIds: number[];
  agentCodes: string[];
  cashRegisters?: AgencyCashRegister[];
}

export interface AgencyRequest {
  name: string;
  address: string;
  active: boolean;
  dailyLimit: number;
  countryIds: number[];
  agentCodes: string[];
  cashRegisterCount?: number;
  cashRegisters?: AgencyCashRegisterRequest[];
}

export interface AgencyCashRegister {
  id: number;
  date?: string;
  openingBalance: number;
  closingBalance?: number;
  closed: boolean;
  agent?: {
    id: number;
    firstName?: string;
    lastName?: string;
    agentCode?: string;
  };
}

export interface AgencyCashRegisterRequest {
  id: number;
  active: boolean;
  agentCode: string;
}

interface AgencyAgentApiResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  agencyId?: number;
  status?: boolean;
  agentCode?: string;
  agencyName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgencyService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/agencies`;

  getAll(): Observable<Agency[]> {
    return this.http.get<Agency[]>(this.baseUrl);
  }

  getById(id: number): Observable<Agency> {
    return this.http.get<Agency>(`${this.baseUrl}/${id}`);
  }

  getAgents(agencyId: number): Observable<Agent[]> {
    return this.http
      .get<AgencyAgentApiResponse[]>(`${this.baseUrl}/${agencyId}/agents`)
      .pipe(map((agents) => agents.map((agent) => this.mapAgent(agent))));
  }

  create(payload: AgencyRequest): Observable<Agency> {
    return this.http.post<Agency>(this.baseUrl, payload);
  }

  update(id: number, payload: AgencyRequest): Observable<Agency> {
    return this.http.put<Agency>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activate(id: number): Observable<Agency> {
    return this.http.patch<Agency>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<Agency> {
    return this.http.patch<Agency>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  private mapAgent(agent: AgencyAgentApiResponse): Agent {
    return {
      id: agent.id,
      firstName: agent.firstName || '',
      lastName: agent.lastName || '',
      email: agent.email || '',
      phone: agent.phone || agent.phoneNumber || '',
      phoneNumber: agent.phone || agent.phoneNumber || '',
      agencyId: agent.agencyId || 0,
      status: Boolean(agent.status),
      agentCode: agent.agentCode,
      agencyName: agent.agencyName,
    };
  }
}

export { AgencyService as AgenciesService };
