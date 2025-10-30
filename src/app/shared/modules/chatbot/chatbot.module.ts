import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotLauncherComponent } from './chatbot-launcher/chatbot-launcher.component';
import { ChatbotWindowComponent } from './chatbot-window/chatbot-window.component';
import { ChatbotService } from './chatbot.service';

@NgModule({
  declarations: [
    ChatbotLauncherComponent,
    ChatbotWindowComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ChatbotLauncherComponent,
    ChatbotWindowComponent
  ],
  providers: [ChatbotService]
})
export class ChatbotModule { }
