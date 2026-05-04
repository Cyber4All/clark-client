import { Component, Input } from '@angular/core';

import { ChatbotLauncherComponent } from '../chatbot-launcher/chatbot-launcher.component';
import { ChatbotWindowComponent } from '../chatbot-window/chatbot-window.component';

@Component({
    selector: 'clark-chatbot-container',
    templateUrl: './chatbot-container.component.html',
    styleUrls: ['./chatbot-container.component.scss'],
    standalone: true,
    imports: [
    ChatbotLauncherComponent,
    ChatbotWindowComponent
],
})
export class ChatbotContainerComponent {
  chatbotState: 'closed' | 'open' | 'minimized' = 'closed';
  @Input() isCookieBannerVisible = false;

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
