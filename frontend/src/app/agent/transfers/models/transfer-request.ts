export interface TransferRequest {
  sentAmount: number;
  sendingCurrencyId: number;
  receivedCurrencyId: number;
  senderCin: string;
  beneficiaryCin: string;
  corridorId: number;
  payoutMethod: 'CASH' | 'MOBILE_MONEY';
}
