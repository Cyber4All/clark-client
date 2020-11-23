import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[hammertime]'
})
export class HammertimeDirective {

  @Output() swipeRight = new EventEmitter();
  @Output() swipeLeft = new EventEmitter();

  swipeStartX = 0;

  constructor() { }
  // Attach a touchstart listener to the div with the directive on it
  @HostListener('touchstart' , ['$event'])
  onSwipe(e) {
    // Get the starting value for the swipe
    this.swipeStartX = e.touches[0].clientX;
  }
  // Attach a touchend listener to the div with the directive on it
  @HostListener('touchend', ['$event'])
  onEnd(e) {
    // If the touchend x value is greater than or equal to the touchstart point then swipeLeft has been initiated.
    // If the touchend x value is less than or equal to the touchstart point then swipeRight has been initiated.
    if (e.changedTouches[0].clientX > this.swipeStartX) {
      this.swipedLeft();
    } else if (e.changedTouches[0].clientX < this.swipeStartX) {
      this.swipedRight();
    }
  }

  swipedRight() {
    this.swipeRight.emit();
  }

  swipedLeft() {
    this.swipeLeft.emit();
  }

}
