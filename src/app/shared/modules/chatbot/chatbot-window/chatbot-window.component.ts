import { Component, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'clark-chatbot-window',
  templateUrl: './chatbot-window-window.component.html',
  styleUrls: ['./chatbot-window.component.scss'],
  animations: [
    trigger('windowSlideIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        animate(
          '300ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ]),
      transition(':leave', [
        animate(
          '300ms ease-out',
          style({
            opacity: 0,
            transform: 'translateY(20px)'
          })
        )
      ])
    ])
  ]
})
export class ChatbotWindowComponent {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @Output() chatbotClosed = new EventEmitter<void>();

  messages: Message[] = [
    {
      id: '1',
      text: 'Hello! I\'m CLARK AI. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ];
  inputMessage = '';
  private isMouseOver = false;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isMouseOver = true;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isMouseOver = false;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.isMouseOver) {
return;
}

    const target = event.target as HTMLElement;
    const messagesContainer = target.closest('.chatbot-messages');

    if (messagesContainer) {
      return; // Allow scrolling in messages
    }

    const chatbotWindow = target.closest('.chatbot-window');
    if (chatbotWindow) {
      event.preventDefault(); // Prevent scrolling in other areas
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isMouseOver) {
return;
}

    const target = event.target as HTMLElement;
    const messagesContainer = target.closest('.chatbot-messages');

    if (messagesContainer) {
      return; // Allow scrolling in messages
    }

    const chatbotWindow = target.closest('.chatbot-window');
    if (chatbotWindow) {
      event.preventDefault(); // Prevent scrolling in other areas
    }
  }

  closeChatbot(): void {
    this.chatbotClosed.emit();
  }

  sendMessage(): void {
    if (this.inputMessage.trim() === '') {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: this.inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.inputMessage = '';

    // Scroll after user message is added
    this.scrollToBottom();

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! This is a mock chatbot interface. The real functionality will be implemented in the service layer.',
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.push(botMessage);
      this.scrollToBottom();
    }, 500);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
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
