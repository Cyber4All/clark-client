import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
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
export class ChatbotLauncherComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isCookieBannerVisible: boolean = false;
  @Output() chatbotOpened = new EventEmitter<void>();

  showTooltip = false;
  bannerHeight = 0;
  private resizeObserver: ResizeObserver;

  ngOnInit(): void {
    this.observeBannerHeight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isCookieBannerVisible']) {
      // When banner visibility changes, update height
      this.updateBannerHeight();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private observeBannerHeight(): void {
    const bannerElement = document.querySelector('clark-cookies');

    if (bannerElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateBannerHeight();
      });

      this.resizeObserver.observe(bannerElement);
      this.updateBannerHeight();
    }
  }

  private updateBannerHeight(): void {
    const bannerElement = document.querySelector('clark-cookies');

    if (bannerElement && this.isCookieBannerVisible) {
      this.bannerHeight = (bannerElement as HTMLElement).offsetHeight + 20;
    } else {
      this.bannerHeight = 0;
    }
  }

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
