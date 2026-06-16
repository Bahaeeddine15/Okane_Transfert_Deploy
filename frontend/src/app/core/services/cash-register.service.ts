import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../utils/constants';

export type CashRegisterStatus = 'OPEN' | 'CLOSED';
export type CashMovementType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_CREATED' | 'TRANSFER_PAID' | string;

export interface CashRegister {
  id: number;
  agentId: number;
  agentName: string;
  agencyId?: number;
  agencyName: string;
  agencyActive?: boolean;
  status: CashRegisterStatus;
  openingBalance: number;
  currentBalance: number;
  openedAt?: string;
  closedAt?: string;
  movements?: CashMovement[];
}

export interface CashMovement {
  id: number;
  cashRegisterId: number;
  type: CashMovementType;
  amount: number;
  movementDate?: string;
  createdAt?: string;
  reference?: string;
  reason?: string;
  balanceAfter?: number;
}

export interface OpenCashRegisterRequest {
  agentId: number;
  openingBalance: number;
}

export interface CreateCashRegisterRequest {
  date: string;
  openingBalance: number;
  closingBalance?: number | null;
  closed: boolean;
  agentCode: string;
  agencyId?: number;
}

export interface CloseCashRegisterRequest {
  cashRegisterId: number;
  countedCash: number;
  reason?: string;
}

export interface CashOperationRequest {
  cashRegisterId?: number;
  agentId: number;
  amount: number;
  reason: string;
}

type CashRegisterApi = Partial<CashRegister> & {
  agent?: { id?: number; firstName?: string; lastName?: string; username?: string; email?: string };
  agency?: { id?: number; name?: string };
  balance?: number;
  closed?: boolean;
  closingBalance?: number;
  date?: string;
  movements?: CashMovementApi[];
};

type CashMovementApi = Partial<CashMovement> & {
  date?: string;
  createdDate?: string;
};

@Injectable({
  providedIn: 'root',
})
export class CashRegisterService {
  private http = inject(HttpClient);
  private cashRegistersUrl = `${API_BASE_URL}/cash-registers`;
  private cashOperationsUrl = `${API_BASE_URL}/cash-register`;

  getCurrentForAgent(agentId: number): Observable<CashRegister | null> {
    return this.http
      .get<CashRegisterApi | null>(`${this.cashOperationsUrl}/current/agent/${agentId}`)
      .pipe(map((cashRegister) => cashRegister ? this.mapCashRegister(cashRegister) : null));
  }

  getAll(): Observable<CashRegister[]> {
    return this.http
      .get<CashRegisterApi[]>(this.cashRegistersUrl)
      .pipe(map((cashRegisters) => cashRegisters.map((cashRegister) => this.mapCashRegister(cashRegister))));
  }

  getById(id: number): Observable<CashRegister> {
    return this.http
      .get<CashRegisterApi>(`${this.cashRegistersUrl}/${id}`)
      .pipe(map((cashRegister) => this.mapCashRegister(cashRegister)));
  }

  create(payload: CreateCashRegisterRequest): Observable<CashRegister> {
    return this.http
      .post<CashRegisterApi>(this.cashRegistersUrl, payload)
      .pipe(map((cashRegister) => this.mapCashRegister(cashRegister)));
  }

  open(payload: OpenCashRegisterRequest): Observable<CashRegister> {
    return this.http
      .post<CashRegisterApi>(`${this.cashOperationsUrl}/open`, payload)
      .pipe(map((cashRegister) => this.mapCashRegister(cashRegister)));
  }

  close(payload: CloseCashRegisterRequest): Observable<CashRegister> {
    return this.http
      .post<CashRegisterApi>(`${this.cashOperationsUrl}/close`, payload)
      .pipe(map((cashRegister) => this.mapCashRegister(cashRegister)));
  }

  closeById(id: number): Observable<CashRegister> {
    return this.http
      .post<CashRegisterApi>(`${this.cashRegistersUrl}/${id}/close`, {})
      .pipe(map((cashRegister) => this.mapCashRegister(cashRegister)));
  }

  reopen(id: number): Observable<CashRegister> {
    return this.http
      .post<CashRegisterApi>(`${this.cashRegistersUrl}/${id}/reopen`, {})
      .pipe(map((cashRegister) => this.mapCashRegister(cashRegister)));
  }

  deposit(payload: CashOperationRequest): Observable<CashMovement> {
    return this.http
      .post<CashMovementApi>(`${this.cashOperationsUrl}/deposit`, payload)
      .pipe(map((movement) => this.mapMovement(movement)));
  }

  withdraw(payload: CashOperationRequest): Observable<CashMovement> {
    return this.http
      .post<CashMovementApi>(`${this.cashOperationsUrl}/withdraw`, payload)
      .pipe(map((movement) => this.mapMovement(movement)));
  }

  getMovements(cashRegisterId: number): Observable<CashMovement[]> {
    return this.http
      .get<CashMovementApi[]>(`${this.cashRegistersUrl}/${cashRegisterId}/movements`)
      .pipe(map((movements) => movements.map((movement) => this.mapMovement(movement))));
  }

  private mapCashRegister(cashRegister: CashRegisterApi): CashRegister {
    const agent = cashRegister.agent;
    const agency = cashRegister.agency;
    const firstName = agent?.firstName || '';
    const lastName = agent?.lastName || '';
    const agentName = cashRegister.agentName || `${firstName} ${lastName}`.trim() || agent?.username || agent?.email || '-';

    return {
      id: Number(cashRegister.id || 0),
      agentId: Number(cashRegister.agentId || agent?.id || 0),
      agentName,
      agencyId: cashRegister.agencyId || agency?.id,
      agencyName: cashRegister.agencyName || agency?.name || '-',
      agencyActive: (agency as any)?.active,
      status: this.normalizeStatus(cashRegister.status, cashRegister.closed),
      openingBalance: Number(cashRegister.openingBalance || 0),
      currentBalance: this.resolveBalance(cashRegister),
      openedAt: cashRegister.openedAt || cashRegister.date,
      closedAt: cashRegister.closedAt,
      movements: (cashRegister.movements || []).map((movement) => this.mapMovement(movement)),
    };
  }

  private mapMovement(movement: CashMovementApi): CashMovement {
    return {
      id: Number(movement.id || 0),
      cashRegisterId: Number(movement.cashRegisterId || 0),
      type: movement.type || 'DEPOSIT',
      amount: Number(movement.amount || 0),
      movementDate: movement.movementDate || movement.date || movement.createdDate || movement.createdAt,
      createdAt: movement.createdAt,
      reference: movement.reference || '-',
      reason: movement.reason || '',
      balanceAfter: movement.balanceAfter,
    };
  }

  private resolveBalance(cashRegister: CashRegisterApi): number {
    if (cashRegister.currentBalance !== undefined) return Number(cashRegister.currentBalance);
    if (cashRegister.balance !== undefined) return Number(cashRegister.balance);
    if (cashRegister.closed && cashRegister.closingBalance !== undefined) return Number(cashRegister.closingBalance);

    const openingBalance = Number(cashRegister.openingBalance || 0);
    const movements = cashRegister.movements || [];

    return movements.reduce((balance, movement) => {
      const amount = Number(movement.amount || 0);
      const type = String(movement.type || '').toUpperCase();

      if (type === 'SENDING' || type === 'DEPOSIT' || type === 'TRANSFER_CREATED') {
        return balance + amount;
      }

      if (type === 'PAYOUT' || type === 'WITHDRAWAL' || type === 'TRANSFER_PAID') {
        return balance - amount;
      }

      return balance;
    }, openingBalance);
  }

  private normalizeStatus(status: unknown, closed?: boolean): CashRegisterStatus {
    if (closed !== undefined) {
      return closed ? 'CLOSED' : 'OPEN';
    }

    return String(status || '').toUpperCase() === 'OPEN' ? 'OPEN' : 'CLOSED';
  }
}