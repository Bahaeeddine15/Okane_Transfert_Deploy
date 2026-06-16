import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  private baseUrl = 'http://localhost:8080/api/transfers';

  constructor(private http: HttpClient) {}

  getTransferByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/code/${code}`);
  }

  confirmTransfer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/confirm`, {});
  }

  payTransfer(payoutCode: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/pay?payoutCode=${payoutCode}`,
      {}
    );
  }
}