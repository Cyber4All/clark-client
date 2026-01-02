import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CoralogixLogSeverity } from '@coralogix/browser';
import { ChatbotService } from 'app/core/chat-module/chatbot.service';
import { CoralogixRumService } from 'app/core/services/coralogix-rum.service';

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
  @Input() feedbackPromptAfterMessageCount = 8;
  @Output() chatbotClosed = new EventEmitter<void>();
  @Output() chatbotMinimized = new EventEmitter<void>();

  messages: Message[] = [];
  inputMessage = '';
  sessionId = '';
  loading = false;

  // Feedback overlay state
  showFeedbackOverlay = false;
  selectedRating: number | null = null;
  hoverRating: number | null = null;
  feedbackMessage = '';
  feedbackSubmitting = false;

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly coralogixService: CoralogixRumService,
    private readonly router: Router,
  ) {
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
  closeChatbot(): void {
    // Starts over a new conversation
    this.chatbotClosed.emit();
    sessionStorage.removeItem('sessionID');
    sessionStorage.removeItem('chatMessages');
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
      this.maybePromptForFeedback();
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
      this.maybePromptForFeedback();
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

  private maybePromptForFeedback(): void {
    // Check if feedback has already been prompted or submitted this session
    const alreadyPrompted = sessionStorage.getItem('clark_ai_feedback_prompted') === 'true';
    const alreadySubmitted = sessionStorage.getItem('clark_ai_feedback_submitted') === 'true';

    if (alreadyPrompted || alreadySubmitted) {
      return;
    }

    // Check if messages count meets the threshold
    if (this.messages.length >= this.feedbackPromptAfterMessageCount) {
      this.showFeedbackOverlay = true;
      sessionStorage.setItem('clark_ai_feedback_prompted', 'true');
    }
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
  }

  setHover(rating: number): void {
    this.hoverRating = rating;
  }

  clearHover(): void {
    this.hoverRating = null;
  }

  getStarState(rating: number): 'selected' | 'hover' | 'empty' {
    if (this.selectedRating !== null && rating <= this.selectedRating) {
      return 'selected';
    }
    if (this.hoverRating !== null && rating <= this.hoverRating) {
      return 'hover';
    }
    return 'empty';
  }

  async submitFeedback(): Promise<void> {
    if (this.selectedRating === null) {
      return;
    }

    this.feedbackSubmitting = true;
    try {
      // Prepare the feedback data
      const feedbackData = {
        rating: this.selectedRating,
        message: this.feedbackMessage.substring(0, 1000), // Cap at 1000 chars
        component: 'clark-chatbot-container',
        messageCountAtPrompt: this.messages.length,
        route: this.router.url,
        timestamp: new Date().toISOString(),
      };

      // Send custom measurement for the rating
      this.coralogixService.sendCustomMeasurement('clark_ai.beta.rating', this.selectedRating);

      // Send custom log event with feedback data
      this.coralogixService.sendLog(
        'CLARK_AI_BETA_FEEDBACK',
        CoralogixLogSeverity.Info,
        {
          ...feedbackData,
          event: 'user_feedback',
          product: 'clark_ai',
          surface: 'chatbot_beta',
        }
      );

      // Mark feedback as submitted
      sessionStorage.setItem('clark_ai_feedback_submitted', 'true');

      // Close the overlay
      this.showFeedbackOverlay = false;
      this.resetFeedbackForm();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      this.feedbackSubmitting = false;
    }
  }

  dismissFeedback(): void {
    this.showFeedbackOverlay = false;
    this.resetFeedbackForm();
  }

  private resetFeedbackForm(): void {
    this.selectedRating = null;
    this.hoverRating = null;
    this.feedbackMessage = '';
  }

  onKeyDownFeedbackTextarea(event: KeyboardEvent): void {
    // Allow Ctrl+Enter to submit (optional enhancement)
    if (event.key === 'Enter' && event.ctrlKey && this.selectedRating !== null) {
      event.preventDefault();
      this.submitFeedback();
    }
  }

  onFeedbackKeyDown(event: KeyboardEvent, star: number): void {
    // Arrow key navigation for star rating
    if (event.key === 'ArrowRight' && star < 5) {
      event.preventDefault();
      this.setRating(star + 1);
    } else if (event.key === 'ArrowLeft' && star > 1) {
      event.preventDefault();
      this.setRating(star - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.setRating(star);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
