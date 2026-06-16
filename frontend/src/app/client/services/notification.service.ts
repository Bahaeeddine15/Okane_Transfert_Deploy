import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/utils/constants';

@Injectable({ providedIn: 'root' })
export class NotificationsService {

  private base = `${API_BASE_URL}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.base}/me`);
  }

  getByTransfer(transferId: number): Observable<any> {
    return this.http.get(`${this.base}/transfer/${transferId}`);
  }

  sendNotification(dto: any): Observable<any> {
    return this.http.post(this.base, dto);
  }
}
