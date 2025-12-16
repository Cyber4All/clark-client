import { Message } from './../../shared/modules/chatbot/chatbot-window/chatbot-window.component';
import { Injectable } from '@angular/core';
import { CoralogixRumService } from 'app/core/services/coralogix-rum.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CHATBOT_ROUTE } from 'app/core/chat-module/chatbot.routes';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ChatbotService {
  constructor(
    private readonly rumService: CoralogixRumService,
    private readonly http: HttpClient
  ) { }
  async sendPrompt(message: Message) {
    return this.http.post(
      CHATBOT_ROUTE.CHAT(),
      { message: message.message, sessionId: message.sessionId },
    ).pipe(
      catchError(this.handleError.bind(this))
    )
      .toPromise();
  }

  private handleError(error: HttpErrorResponse) {
    this.rumService.trackEvent('Chatbot Error', {
      message: error.message,
      status: error.status,
      error: error.error
    });

    if (error.error instanceof ErrorEvent) {
      return throwError(error.error.message);
    } else {
      return throwError(error);
    }
  }
}
