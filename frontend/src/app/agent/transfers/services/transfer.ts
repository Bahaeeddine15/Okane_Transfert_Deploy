import { Injectable } from '@angular/core';
import { Api } from '../../../core/services/api';
import { TransferRequest } from '../models/transfer-request';
import { TransferResponse } from '../models/transfer-response';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  constructor(private api: Api) {}

  createTransfer(data: TransferRequest) {
    return this.api.post<TransferResponse>('/transfers', data);
  }

  getByCode(code: string) {
    return this.api.get<TransferResponse>(`/transfers/code/${code}`);
  } 

  getAgentTransfers() {
    return this.api.get<TransferResponse[]>('/transfers/my-transfers');
  }

  cancelTransfer(id: number) {
    return this.api.put(`/transfers/${id}/cancel`, {});
  }

  payTransfer(payoutCode: string) {
    return this.api.post<TransferResponse>(
      `/transfers/pay?payoutCode=${payoutCode}`,
      {}
    );
  }

  getAll() {
    return this.api.get<TransferResponse[]>('/transfers');
  }
}
