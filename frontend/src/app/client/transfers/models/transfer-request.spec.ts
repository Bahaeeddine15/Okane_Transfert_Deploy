import { TransferRequest } from './transfer-request';

describe('TransferRequest', () => {
  it('should create an instance', () => {
    const request: TransferRequest = {
      sentAmount: 100,
      sendingCurrencyId: 1,
      receivedCurrencyId: 2,
      senderCin: 'AA123',
      beneficiaryCin: 'BB456',
      corridorId: 1,
      payoutMethod: 'CASH'
    };

    expect(request).toBeTruthy();
  });
});
