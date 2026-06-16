import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/utils/constants';

export type ChatbotLanguage = 'fr' | 'en' | 'ar';

export interface ChatbotRequest {
  conversationId: number | null;
  message: string;
  language: ChatbotLanguage;
}

export interface ChatbotResponse {
  conversationId: number;
  reply: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly endpoint = `${API_BASE_URL}/chatbot/message`;

  constructor(private http: HttpClient) {}

  sendMessage(request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(this.endpoint, request);
  }
}
