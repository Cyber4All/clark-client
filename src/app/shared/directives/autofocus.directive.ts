import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * A directive to simulate the functionality of the autofocus attribute on inputs in Angular.
 * This is needed because the autofocus attribute only works on page load, but Angular is a SPA.
 *
 * Usage: <input ... [autofocus] />
 *
 * Additionally, the directive can be given a value (e.g. <input ... [autofocus]="MY_CONDITION" />)
 * so that the developer can have more control in the way focusing is coordinated.
 *
 * @class AutofocusDirective
 */
@Directive({
  selector: '[autofocus]',
})
export class AutofocusDirective implements OnInit {
  private focus = true;

  constructor(private el: ElementRef) {}

  @Input() set autofocus(condition: boolean) {
    this.focus = condition !== false;
  }

  ngOnInit() {
    if (this.focus) {
      // Prevents expression has changed after it was checked error
      window.setTimeout(() => {
        // For SSR (server side rendering) this is not safe. Use: https://github.com/angular/angular/issues/15008#issuecomment-285141070)
        this.el.nativeElement.focus();
      });
    }
  }
}
