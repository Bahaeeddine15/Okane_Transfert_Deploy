import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class TransferService {

  private base = '/api/transfers';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get(`${this.base}`);
  }
}