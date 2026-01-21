import { Component, Input } from '@angular/core';

@Component({
  selector: 'clark-chatbot-container',
  templateUrl: './chatbot-container.component.html',
  styleUrls: ['./chatbot-container.component.scss'],
})
export class ChatbotContainerComponent {
  chatbotState: 'closed' | 'open' | 'minimized' = 'closed';
  @Input() isCookieBannerVisible: boolean = false;

  openChatbot(): void {
    this.chatbotState = 'open';
  }

  closeChatbot(): void {
    this.chatbotState = 'closed';
  }

  minimizeChatbot(): void {
    this.chatbotState = 'minimized';
  }
}
