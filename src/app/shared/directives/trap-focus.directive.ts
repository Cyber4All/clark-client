import { Directive, ElementRef, OnDestroy } from '@angular/core';

@Directive({
  selector: '[trapFocus]'
})
export class TrapFocusDirective implements OnDestroy {

  constructor(private host: ElementRef<HTMLElement>) {
    this.host.nativeElement.classList.add('focus--trapped');

    this.focusFirstElement();

    setTimeout(() => {
      document.querySelectorAll('.focus--trapped *').forEach((el: HTMLElement) => {
        el.classList.add('focus--trapped');

        el.addEventListener('blur', (event) => {
          if (!(event.relatedTarget as HTMLElement).classList.contains('focus--trapped')) {
            // if we've left the focus-trapped region, refocus the first element in the focus-trapped region
            this.focusFirstElement();
          }
        });
      });
    });
  }

/**
 * Focus the first element in the focus-trapped region
 *
 * @memberof TrapFocusDirective
 */
  focusFirstElement() {
    setTimeout(() => {
      try {
        (document.querySelector('.focus--trapped') as HTMLElement).focus();
      } catch (_) {
        // do nothing since this error is expected if the element has been removed from the DOM
      }
    });
  }

  ngOnDestroy() {
    // remove any remaining focus--trapped classes from the DOM
    document.querySelectorAll('.focus--trapped').forEach((el: HTMLElement) => {
      el.classList.remove('focus--trapped');
    });
  }
}
