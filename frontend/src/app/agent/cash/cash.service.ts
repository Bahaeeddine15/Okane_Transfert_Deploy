import { Injectable } from '@angular/core';
import { Api } from '../../core/services/api';

export interface CashRegister {
  id: number;
  date: string;
  openingBalance: number;
  closingBalance: number | null;
  closed: boolean;
  agent: { agentCode: string } | null;
  agency: { id: number; name: string } | null;
}

@Injectable({ providedIn: 'root' })
export class CashService {
  constructor(private api: Api) {}

  getByAgentCode(agentCode: string) {
    return this.api.get<CashRegister[]>(`/cash-registers/agent/${agentCode}`);
  }

  getBalance(id: number) {
    return this.api.get<number>(`/cash-registers/${id}/balance`);
  }

  close(id: number) {
    return this.api.post<CashRegister>(`/cash-registers/${id}/close`, {});
  }

  reopen(id: number) {
    return this.api.post<CashRegister>(`/cash-registers/${id}/reopen`, {});
  }
}
