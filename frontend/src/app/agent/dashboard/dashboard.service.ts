import { Injectable, inject } from '@angular/core';
import {
  map,
  forkJoin,
  Observable,
  of,
  switchMap,
  catchError,
  timeout,
} from 'rxjs';
import { Api } from '../../core/services/api';
import { TransferResponse } from '../transfers/models/transfer-response';

export interface CashRegisterInfo {
  id: number;
  balance: number;
  date: string;
  closed: boolean;
}

export interface AgentDashboardData {
  totalTransfers: number;
  pendingTransfers: number;
  pendingAmount: number;
  cashAvailable: number;
  clientsServed: number;
  recentTransfers: TransferResponse[];
  agentName: string;
  cashRegister: CashRegisterInfo | null;
}

const API_TIMEOUT = 5000;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private api = inject(Api);

  loadDashboardData(): Observable<AgentDashboardData> {
    // Fetch all data independently — one failure won't block others
    const transfers$ = this.api
      .get<TransferResponse[]>('/transfers/my-transfers')
      .pipe(timeout(API_TIMEOUT), catchError(() => of([])));

    const agent$ = this.api
      .get<any>('/agents/me')
      .pipe(timeout(API_TIMEOUT), catchError(() => of(null)));

    return forkJoin({ transfers: transfers$, agent: agent$ }).pipe(
      switchMap(({ transfers, agent }) => {
        const agentCode = agent?.agentCode || '';
        const agentName = agent
          ? agent.firstName + ' ' + agent.lastName
          : 'Agent';

        return this.api
          .get<any[]>(`/agents/cash-registers/agent/${agentCode}`)
          .pipe(
            timeout(API_TIMEOUT),
            catchError(() => of([])),
            switchMap((cashRegisters) => {
              const active = cashRegisters?.find((cr) => !cr.closed);

              if (active) {
                return this.api
                  .get<number>(`/agents/cash-registers/${active.id}/balance`)
                  .pipe(
                    timeout(API_TIMEOUT),
                    catchError(() => of(0)),
                    map((balance) => ({
                      cashRegisters,
                      active,
                      realBalance: balance,
                    }))
                  );
              }

              return of({ cashRegisters, active: null, realBalance: 0 });
            }),
            map(({ cashRegisters, active, realBalance }) => {
              const pendingTransfers = transfers.filter(
                (t) => t.status === 'PENDING'
              );

              const clientSet = new Set<string>();
              transfers.forEach((t) => {
                if (t.senderName)
                  clientSet.add(`sender:${t.senderName}`);
                if (t.beneficiaryName)
                  clientSet.add(`benef:${t.beneficiaryName}`);
              });

              const pendingAmount = pendingTransfers.reduce(
                (sum, t) => sum + (t.sentAmount || 0),
                0
              );

              const latest =
                active ||
                cashRegisters?.[cashRegisters.length - 1] ||
                null;
              let cashRegister: CashRegisterInfo | null = null;
              if (latest) {
                cashRegister = {
                  id: latest.id,
                  balance:
                    realBalance ||
                    (latest.closingBalance ??
                      latest.openingBalance ??
                      0),
                  date: latest.date,
                  closed: latest.closed,
                };
              }

              const recentTransfers = transfers.slice(0, 5);

              return {
                totalTransfers: transfers.length,
                pendingTransfers: pendingTransfers.length,
                pendingAmount: Math.round(pendingAmount * 100) / 100,
                cashAvailable: cashRegister
                  ? cashRegister.balance
                  : Math.round(pendingAmount * 100) / 100,
                clientsServed: clientSet.size,
                recentTransfers,
                agentName,
                cashRegister,
              };
            })
          );
      }),
      catchError(() =>
        of({
          totalTransfers: 0,
          pendingTransfers: 0,
          pendingAmount: 0,
          cashAvailable: 0,
          clientsServed: 0,
          recentTransfers: [],
          agentName: 'Agent',
          cashRegister: null,
        })
      )
    );
  }
}