import { Component, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'clark-chatbot-launcher',
  templateUrl: './chatbot-launcher.component.html',
  styleUrls: ['./chatbot-launcher.component.scss'],
  animations: [
    trigger('tooltipAppear', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(10px)'
        }),
        animate(
          '200ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ]),
      transition(':leave', [
        animate(
          '200ms ease-out',
          style({
            opacity: 0,
            transform: 'translateY(10px)'
          })
        )
      ])
    ])
  ]
})
export class ChatbotLauncherComponent {
  @Output() chatbotOpened = new EventEmitter<void>();
  
  showTooltip = false;

  openChatbot(): void {
    this.chatbotOpened.emit();
    this.showTooltip = false;
  }

  onMouseEnter(): void {
    this.showTooltip = true;
  }

  onMouseLeave(): void {
    this.showTooltip = false;
  }
}
