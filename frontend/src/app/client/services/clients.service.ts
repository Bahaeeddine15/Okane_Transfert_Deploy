import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/utils/constants';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private base = `${API_BASE_URL}/clients`;
  
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<any> { 
    return this.http.get(this.base, { params }); 
  }
  
  getById(id: number): Observable<any> { 
    return this.http.get(`${this.base}/${id}`); 
  }
  
  create(payload: any): Observable<any> { 
    return this.http.post(this.base, payload); 
  }
  
  update(id: number, payload: any): Observable<any> { 
    return this.http.put(`${this.base}/${id}`, payload); 
  }
  
  delete(id: number): Observable<any> { 
    return this.http.delete(`${this.base}/${id}`); 
  }
  
  search(q: string): Observable<any> { 
    return this.http.get(`${this.base}/search`, { params: { q } }); 
  }
  
  getHistory(id: number): Observable<any> { 
    return this.http.get(`${this.base}/${id}/transfers`); 
  }

  getSentTransfers(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/clients/me/transfers/sent`);
  }

  getReceivedTransfers(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/clients/me/transfers/received`);
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/clients/me`);
  }
  
  updateMyProfile(payload: any): Observable<any> {
    return this.http.put(`${API_BASE_URL}/clients/me/profile`, payload);
  }
}
