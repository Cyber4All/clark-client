import { ChatbotService } from 'app/core/chat-module/chatbot.service';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

export interface Message {
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sessionId: string;
}

@Component({
  selector: 'clark-chatbot-window',
  templateUrl: './chatbot-window.component.html',
  styleUrls: ['./chatbot-window.component.scss'],
  animations: [
    trigger('windowSlideIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)',
        }),
        animate(
          '300ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          }),
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-out',
          style({
            opacity: 0,
            transform: 'translateY(20px)',
          }),
        ),
      ]),
    ]),
  ],
})
export class ChatbotWindowComponent {
  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;
  @Output() chatbotClosed = new EventEmitter<void>();
  @Output() chatbotMinimized = new EventEmitter<void>();

  messages: Message[] = [];
  inputMessage = '';
  sessionId = '';
  loading = false;

  constructor(private readonly chatbotService: ChatbotService) {
    const sessionId = sessionStorage.getItem('sessionID');
    const sessionMessages = sessionStorage.getItem('chatMessages');
    this.sessionId = sessionId ?? '';
    this.messages = sessionMessages
      ? JSON.parse(sessionMessages)
      : [
        {
          message: 'Hello! I\'m CLARK AI. How can I help you today?',
          sender: 'bot',
          timestamp: new Date(),
          sessionId: '',
        },
      ];
  }
  newChatSession(): void {
    // Starts over a new conversation
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('chatMessages');
    this.sessionId = '';
    this.messages = [
      {
        message: 'Hello! I\'m CLARK AI. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        sessionId: '',
      },
    ];
    this.updateSessionStorage();
  }

  minimizeChatbot(): void {
    this.chatbotMinimized.emit();
  }

  async sendMessage(): Promise<void> {
    if (this.inputMessage.trim() === '') {
      return;
    }
    // Add user message
    const userMessage: Message = {
      message: this.inputMessage,
      timestamp: new Date(),
      sender: 'user',
      sessionId: this.sessionId,
    };
    this.messages.push(userMessage);
    // Scroll after user message is added
    this.scrollToBottom();
    this.inputMessage = '';
    this.loading = true;

    try {
      // Send to backend
      const response = (await this.chatbotService.sendPrompt(userMessage)) as {
        message: string;
        sessionId: string;
      };
      this.sessionId = response.sessionId;
      const botMessage: Message = {
        message: response.message,
        timestamp: new Date(),
        sender: 'bot',
        sessionId: this.sessionId,
      };
      this.messages.push(botMessage);
      this.updateSessionStorage();
      this.scrollToBottom();
    } catch (error) {
      const errorMessage: Message = {
        message: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
        sender: 'bot',
        sessionId: this.sessionId,
      };
      console.log(error);
      this.messages.push(errorMessage);
      this.updateSessionStorage();
      this.scrollToBottom();
    } finally {
      this.loading = false;
    }
  }

  private updateSessionStorage(): void {
    sessionStorage.setItem('sessionID', this.sessionId);
    sessionStorage.setItem('chatMessages', JSON.stringify(this.messages));
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
