import { Component, OnInit } from '@angular/core';
import { ChatbotService } from '../chatbot.service';
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
export class ChatbotLauncherComponent implements OnInit {
  showTooltip = false;
  isChatbotOpen = false;

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    this.chatbotService.isOpen$.subscribe(isOpen => {
      this.isChatbotOpen = isOpen;
    });
  }

  openChatbot(): void {
    this.chatbotService.toggleChatbot();
    this.showTooltip = false;
  }

  onMouseEnter(): void {
    this.showTooltip = true;
  }

  onMouseLeave(): void {
    this.showTooltip = false;
  }
}
