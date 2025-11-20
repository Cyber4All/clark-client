import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotLauncherComponent } from './chatbot-launcher/chatbot-launcher.component';
import { ChatbotWindowComponent } from './chatbot-window/chatbot-window.component';
import { ChatbotContainerComponent } from './chatbot-container/chatbot-container.component';

@NgModule({
  declarations: [
    ChatbotLauncherComponent,
    ChatbotWindowComponent,
    ChatbotContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ChatbotContainerComponent
  ]
})
export class ChatbotModule { }
