import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ChatbotLanguage, ChatbotService } from './chatbot.service';

interface ChatMessage {
  author: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent {
  @ViewChild('messagesList') private messagesList?: ElementRef<HTMLDivElement>;

  isOpen = false;
  isLoading = false;
  message = '';
  language: ChatbotLanguage = 'fr';
  conversationId: number | null = null;
  messages: ChatMessage[] = [
    {
      author: 'assistant',
      text: 'Hello, how can I help you today?',
    },
  ];

  private readonly storageKey = 'okane_chatbot_conversation_id';
  private readonly fallbackMessage =
    'The assistant is temporarily unavailable. Please try again later.';

  constructor(
    private chatbotService: ChatbotService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.conversationId = this.loadConversationId();
  }

  openChat(): void {
    this.isOpen = true;
    this.scrollToBottom();
  }

  closeChat(): void {
    this.isOpen = false;
  }

  sendMessage(): void {
    const text = this.message.trim();

    if (!text || this.isLoading) {
      return;
    }

    this.messages = [...this.messages, { author: 'user', text }];
    this.message = '';
    this.isLoading = true;
    this.scrollToBottom();

    this.chatbotService
      .sendMessage({
        conversationId: this.conversationId,
        message: text,
        language: this.language,
      })
      .subscribe({
        next: (response) => {
          this.conversationId = response.conversationId;
          this.saveConversationId(response.conversationId);
          this.messages = [...this.messages, { author: 'assistant', text: response.reply }];
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: () => {
          this.messages = [...this.messages, { author: 'assistant', text: this.fallbackMessage }];
          this.isLoading = false;
          this.scrollToBottom();
        },
      });
  }

  private loadConversationId(): number | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storedValue = localStorage.getItem(this.storageKey);
    const parsedValue = storedValue ? Number(storedValue) : NaN;

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  private saveConversationId(conversationId: number): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, String(conversationId));
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.messagesList?.nativeElement;

      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }
}
