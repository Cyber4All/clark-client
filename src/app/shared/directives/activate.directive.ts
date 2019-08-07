import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[activate]'
})
export class ActivateDirective {

  @Output() activate: EventEmitter<Event> = new EventEmitter();

  constructor(private el: ElementRef<HTMLElement>) {
    // since we've deemed the host element as 'activatable', adorn it with the appropriate tabindex and aria-role values
    this.el.nativeElement.setAttribute('tabindex', '0');
    this.el.nativeElement.setAttribute('role', 'button');
  }

  @HostListener('click', ['$event'])
  @HostListener('keypress', ['$event'])
  handleActivate(event: KeyboardEvent | MouseEvent) {

    if (event instanceof KeyboardEvent) {
      // if the active element is an input, disregard the event
      if (document.activeElement.tagName === 'INPUT' && document.activeElement.getAttribute('type') === 'text') {
        return;
      }
      // if this isn't an 'activation' key, disregard this event
      if (event.code !== 'Enter' && event.code !== 'Space') {
        return;
      }

      if (this.el.nativeElement.hasAttribute('ng-reflect-router-link')) {
        // trigger a synthetic click event that will not bubble if the element has a routerLink directive
        const syntheticEvent = new Event('click', { bubbles: false });
        this.el.nativeElement.dispatchEvent(syntheticEvent);
      }
    }

    this.activate.emit(event);

    event.preventDefault();
  }

}
