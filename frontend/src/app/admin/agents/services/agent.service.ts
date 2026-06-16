import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/utils/constants';

export interface Agent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  agencyId: number;
  status: boolean;
  agentCode?: string;
  agencyName?: string;
  agencyActive?: boolean;
}

export interface AgentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  agencyId: number;
  status: boolean;
  agentCode: string;
  password?: string;
}

interface AgentApiResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  agencyId?: number;
  status?: boolean;
  role?: string;
  agentCode?: string;
  agencyName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private http = inject(HttpClient);
  private adminUsersUrl = `${API_BASE_URL}/admin/users`;

  getAll(): Observable<Agent[]> {
    return this.http
      .get<AgentApiResponse[]>(`${this.adminUsersUrl}/by-role`, { params: { role: 'AGENT' } })
      .pipe(map((agents) => agents.map((agent) => this.mapAgent(agent))));
  }

  getById(id: number): Observable<Agent> {
    return this.http
      .get<AgentApiResponse>(`${this.adminUsersUrl}/${id}`)
      .pipe(map((agent) => this.mapAgent(agent)));
  }

  create(payload: AgentRequest): Observable<Agent> {
    return this.http
      .post<AgentApiResponse>(this.adminUsersUrl, this.toCreatePayload(payload))
      .pipe(map((agent) => this.mapAgent(agent)));
  }

  update(id: number, payload: AgentRequest): Observable<Agent> {
    return this.http
      .put<AgentApiResponse>(`${this.adminUsersUrl}/${id}`, this.toUpdatePayload(payload))
      .pipe(map((agent) => this.mapAgent(agent)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUsersUrl}/${id}`);
  }

  assignToAgency(id: number, agencyId: number): Observable<Agent> {
    return this.http
      .put<AgentApiResponse>(`${this.adminUsersUrl}/${id}`, { agencyId })
      .pipe(map((agent) => this.mapAgent(agent)));
  }

  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.adminUsersUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.adminUsersUrl}/${id}/deactivate`, {});
  }

  private toCreatePayload(payload: AgentRequest): Record<string, unknown> {
    return {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phone,
      password: payload.password,
      status: payload.status,
      agencyId: payload.agencyId,
      agentCode: payload.agentCode,
      role: 'AGENT',
    };
  }

  private toUpdatePayload(payload: AgentRequest): Record<string, unknown> {
    return {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phone,
      status: payload.status,
      agencyId: payload.agencyId,
      agentCode: payload.agentCode,
    };
  }

  private mapAgent(agent: AgentApiResponse): Agent {
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
      agencyActive: (agent as any).agencyActive,
    };
  }
}
