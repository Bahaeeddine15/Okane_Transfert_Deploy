import { Injectable } from '@angular/core';
import { Api } from '../../core/services/api';
import { Client } from '../models/client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private api: Api) {}

  getAllClients() {
    return this.api.get<Client[]>('/clients');
  }
}