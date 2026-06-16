import { TransferResponse } from './transfer-response';

describe('TransferResponse', () => {
  it('should accept transfer response data', () => {
    const response = { id: 1, payoutCode: 'ABC12345' } as TransferResponse;

    expect(response.payoutCode).toBe('ABC12345');
  });
});
