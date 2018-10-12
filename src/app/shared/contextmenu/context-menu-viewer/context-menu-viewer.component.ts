import { Component, EventEmitter, Output, Input } from '@angular/core';

/**
 * This component is simply a wrapper for any content projected into it (from the ContextMenuService).
 * It signals click away closes to the service, but all other functionality is  managed directly by the service 
 * or from it's controller component.
 */
@Component({
  selector: 'clark-context-menu-viewer',
  template: `
  <div class="full-screen" (click)="activateClose()">
    <div class="context-menu" (click)="$event.stopPropagation();"><ng-content></ng-content></div>
  </div>`,
  styleUrls: ['context-menu-viewer.component.scss']
})
export class ContextMenuViewerComponent {
  @Input() id: string;
  @Output() close: EventEmitter<string> = new EventEmitter();

  /**
   * Send a close event up to the contextmenu service
   */
  activateClose() {
    this.close.emit(this.id);
  }
}
