export interface TransferResponse {
  id: number;
  payoutCode: string;

  sentAmount: number;
  receivedAmount: number;
  cost: number;
  appliedRate: number;

  sendingCurrency: string;
  receivedCurrency: string;

  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED';
  payoutMethod: 'CASH' | 'MOBILE_MONEY';

  createdAt: string | number[];
  expiredAt: string | number[];
  paidAt?: string | number[] | null;

  senderName: string;
  senderCin: string;
  beneficiaryName: string;
  beneficiaryCin: string;
  agentName: string;
  corridorLabel: string;
}
