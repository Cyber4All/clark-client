import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ChatbotService } from '../chatbot.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

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
export class ChatbotWindowComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  isOpen = false;
  messages: Message[] = [
    {
      id: '1',
      text: 'Hello! I\'m CLARK AI. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ];
  inputMessage = '';
  private subscription: Subscription = new Subscription();

  private preventScrollHandler = (e: WheelEvent | TouchEvent) => {
    const target = e.target as HTMLElement;

    // Check if the event is coming from inside the messages container
    const messagesContainer = target.closest('.chatbot-messages');
    if (messagesContainer) {
      // Allow natural scrolling within the messages container
      return;
    }

    // Check if the event is from inside the chatbot window but not the messages container
    const chatbotWindow = target.closest('.chatbot-window');
    if (chatbotWindow) {
      // Prevent scrolling for the header, input, and other parts
      e.preventDefault();
      return;
    }

    // Allow scrolling outside the chatbot completely
  };

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.chatbotService.isOpen$.subscribe(isOpen => {
        this.isOpen = isOpen;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    document.removeEventListener('wheel', this.preventScrollHandler);
    document.removeEventListener('touchmove', this.preventScrollHandler);
  }

  closeChatbot(): void {
    this.chatbotService.closeChatbot();
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

    this.scrollToBottom();
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

  onMouseEnter(): void {
    document.addEventListener('wheel', this.preventScrollHandler, { passive: false });
    document.addEventListener('touchmove', this.preventScrollHandler, { passive: false });
  }

  onMouseLeave(): void {
    document.removeEventListener('wheel', this.preventScrollHandler);
    document.removeEventListener('touchmove', this.preventScrollHandler);
  }
}
