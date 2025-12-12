import { Component } from '@angular/core';

@Component({
  selector: 'clark-chatbot-container',
  templateUrl: './chatbot-container.component.html',
  styleUrls: ['./chatbot-container.component.scss']
})
export class ChatbotContainerComponent {
  isChatbotOpen = false;

  openChatbot(): void {
    this.isChatbotOpen = true;
  }

  closeChatbot(): void {
    this.isChatbotOpen = false;
  }
}
