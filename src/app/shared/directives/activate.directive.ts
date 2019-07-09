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
    event.preventDefault();

    if (event instanceof KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
    }

    this.activate.emit(event);
  }

}
