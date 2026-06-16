import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { Agency, AgenciesService } from '../../agencies/services/agencies.service';
import { Agent, AgentsService } from '../../agents/services/agents.service';
import { API_BASE_URL } from '../../../core/utils/constants';
import { DashboardStatistics, TransferSummary } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private agenciesService = inject(AgenciesService);
  private agentsService = inject(AgentsService);

  getStatistics(): Observable<DashboardStatistics> {
    return forkJoin({
      agencies: this.getAgencies(),
      agents: this.getAgents(),
      transfers: this.getTransfers(),
    }).pipe(
      map(({ agencies, agents, transfers }) => ({
        totalAgencies: agencies.length,
        totalAgents: agents.length,
        totalTransfers: transfers.length,
        totalRevenue: this.calculateRevenue(transfers),
      }))
    );
  }

  getTransfers(): Observable<TransferSummary[]> {
    return this.http
      .get<TransferSummary[]>(`${API_BASE_URL}/transfers`)
      .pipe(catchError(() => of([] as TransferSummary[])));
  }

  private getAgencies(): Observable<Agency[]> {
    return this.agenciesService.getAll().pipe(catchError(() => of([] as Agency[])));
  }

  private getAgents(): Observable<Agent[]> {
    return this.agentsService.getAll().pipe(catchError(() => of([] as Agent[])));
  }

  private calculateRevenue(transfers: TransferSummary[]): number {
    return transfers.reduce((sum, transfer) => sum + (transfer.cost || 0), 0);
  }
}
