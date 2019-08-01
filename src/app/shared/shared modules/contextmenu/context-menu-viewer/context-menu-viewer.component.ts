import { Component, EventEmitter, Input, HostListener } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * This component is simply a wrapper for any content projected into it (from the original ContextMenuComponent).
 * It signals click away and escape-key closes to the component, but all other functionality is  managed
 * directly from it's controller component.
 */
@Component({
  selector: 'clark-context-menu-viewer',
  template: `
    <div class="full-screen">
      <div [@contextMenu] class="context-menu"><ng-content></ng-content></div>
    </div>
  `,
  styleUrls: ['context-menu-viewer.component.scss'],
  animations: [
    trigger('contextMenu', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(0px) scale(1, 0' }),
        animate('200ms ease', style({ opacity: 1, transform: 'translateY(0px) scale(1, 1)' }))
      ]),
    ])
  ]
})
export class ContextMenuViewerComponent {
  @Input() close: EventEmitter<void> = new EventEmitter();

  @HostListener('window:keyup', ['$event']) handleKeyPress(
    event: KeyboardEvent
  ) {
    if (event.code === 'Escape') {
      this.activateClose();
    }
  }

  /**
   * Send a close event up to the master component
   */
  activateClose() {
    this.close.emit();
  }
}
