import { Component, OnInit, OnDestroy} from '@angular/core';
import { ChatbotService } from '../chatbot.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

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
export class ChatbotLauncherComponent implements OnInit, OnDestroy {
  showTooltip = false;
  isChatbotOpen = false;
  private subscription: Subscription = new Subscription();

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.chatbotService.isOpen$.subscribe(isOpen => {
        this.isChatbotOpen = isOpen;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
