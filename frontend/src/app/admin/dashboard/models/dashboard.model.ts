export interface TransferSummary {
  id: number;
  payoutCode?: string;
  sentAmount?: number;
  receivedAmount?: number;
  cost?: number;
  sendingCurrency?: string;
  receivedCurrency?: string;
  status?: string;
  createdAt?: string;
  senderName?: string;
  beneficiaryName?: string;
  agentName?: string;
}

export interface DashboardStatistics {
  totalAgencies: number;
  totalAgents: number;
  totalTransfers: number;
  totalRevenue: number;
}
