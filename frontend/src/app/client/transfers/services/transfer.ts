import { Injectable } from '@angular/core';
import { Api } from '../../../core/services/api';
import { TransferResponse } from '../models/transfer-response';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  constructor(private api: Api) {}

  getSentTransfers() {
    return this.api.get<TransferResponse[]>('/clients/me/transfers/sent');
  }

  getReceivedTransfers() {
    return this.api.get<TransferResponse[]>('/clients/me/transfers/received');
  }

  getByCode(code: string) {
    return this.api.get<TransferResponse>(`/transfers/code/${code}`);
  } 
}
