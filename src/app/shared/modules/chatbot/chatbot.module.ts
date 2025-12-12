import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotLauncherComponent } from './chatbot-launcher/chatbot-launcher.component';
import { ChatbotWindowComponent } from './chatbot-window/chatbot-window.component';
import { ChatbotContainerComponent } from './chatbot-container/chatbot-container.component';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  declarations: [
    ChatbotLauncherComponent,
    ChatbotWindowComponent,
    ChatbotContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule.forRoot()
  ],
  exports: [
    ChatbotContainerComponent
  ]
})
export class ChatbotModule { }
