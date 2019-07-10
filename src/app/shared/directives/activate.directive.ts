import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[activate]'
})
export class ActivateDirective {

  @Output() activate: EventEmitter<Event> = new EventEmitter();

  constructor(private el: ElementRef<HTMLElement>) {
    this.el.nativeElement.setAttribute('tabindex', '0');
    this.el.nativeElement.setAttribute('role', 'button');
  }

  @HostListener('click', ['$event'])
  @HostListener('keypress', ['$event'])
  handleActivate(event: KeyboardEvent | MouseEvent) {

    if (event instanceof KeyboardEvent) {
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
