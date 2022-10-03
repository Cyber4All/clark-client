import { Directive, Input, HostListener, OnChanges, SimpleChanges, OnDestroy, ElementRef } from '@angular/core';

@Directive({
  selector: '[tip]'
})
export class TipDirective implements OnChanges, OnDestroy {
  // the text of the tooltip
  @Input() tip: string;

  // dictates whether the tip will show on `mouseenter`
  @Input() tipDisabled: boolean;

  // dictates the location of the tooltip relative to the parent element
  @Input() tipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  // dictates the tip's style (dark = white text on dark background, light = dark text on light background)
  @Input() tipStyle: 'light' | 'dark' = 'dark';

  // the delay before a tip shows after the `mouseenter` event has fired in milliseconds
  @Input() tipDelay: number;

  // the time-to-live for the tip after the `mouseleave` event has fired in milliseconds
  @Input() tipPersistDuration: number;

  showTimeout: any; // this is a NodeJS.Timer but types aren't working correctly
  hideTimeout: any; // this is a NodeJS.Timer but types aren't working correctly
  animationTimeout: any; // this is a NodeJS.Timer but types aren't working correctly

  // elements
  element: HTMLElement;
  innerElement: HTMLElement;
  triangleElement: HTMLElement;

  visible: boolean;

  constructor(private host: ElementRef) {
    // create the outer HTML element
    this.element = document.createElement('div');

    // create the inner HTML element
    this.innerElement = document.createElement('div');
    this.innerElement.style.position = 'relative';
    this.innerElement.classList.add('tooltip');

    // create the triangle HTML element
    this.triangleElement = document.createElement('div');
    this.triangleElement.classList.add('tooltip');

    // append both inner and triangle elements to outer element
    this.element.appendChild(this.triangleElement);
    this.element.appendChild(this.innerElement);

    this.element.classList.add('tooltip');
    this.element.setAttribute('aria-label', this.tip);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tip && this.visible) {
      // the tip's text-content changed and the tip is visible, we should change the tooltip's content
      this.hideTooltip();
      this.showTooltip();
    } else if (changes.tipDisabled) {
      if (changes.tipDisabled.currentValue && this.visible) {
        // the tooltip is showing and the `tipDisabled` value changed to true, we should remove the tooltip
        this.element.remove();
      }
    }
  }

  @HostListener('mouseenter')
  @HostListener('focus')
  showTooltip() {
    if (!this.tipDisabled && !this.visible) {
      this.visible = true;

      // if we're in the process of removing the tip, halt that process
      clearTimeout(this.hideTimeout);
      clearTimeout(this.animationTimeout);

      // if there's a tip delay, wait for the delay duration before showing
      this.showTimeout = setTimeout(() => {

        // append the element to the DOM, it's invisible at this point
        this.innerElement.innerText = this.tip;
        this.element.setAttribute('aria-label', this.tip);
        document.body.prepend(this.element);

        // @ts-ignore typescript thinks that style is a read-only property but it isn't
        this.element.style = `
          background: ${this.tipStyle === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
          color: ${this.tipStyle === 'dark' ? 'white' : 'black'};
          border-radius: 3px;
          padding: 10px;
          position: absolute;
          box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.1);
          transition: opacity 0.2s ease;
          opacity: 0;
          z-index: 9001;
          max-width: 300px;
          font-size: 14px;
        `;
        // position the tooltip
        this.positionTooltip(this.host.nativeElement as HTMLElement);


        // fade the tooltip in
        this.element.style.opacity = '1';

        clearTimeout(this.showTimeout);
      }, this.tipDelay || 0);
    }
  }

  @HostListener('mouseleave', ['$event'])
  @HostListener('blur')
  hideTooltip(event?) {
    // retrieve the next element to be hovered
    const nextTarget: HTMLElement = event ? event.toElement || event.relatedTarget : undefined;

    // we're mousing onto a tooltip, which most likely means the tooltip ran out of space and overlaps the target element. DO NOT close the,
    // the tooltip, rather add an event listener onto the tip itself to remove when the mouse leaves the tip
    if (nextTarget && nextTarget.classList.contains('tooltip')) {
      this.element.addEventListener('mouseleave', () => this.hideTooltip());
      return;
    }

    if (!this.tipDisabled && this.visible) {
      this.visible = false;

      // if we're in the process of showing the tooltip, halt that process
      clearTimeout(this.showTimeout);

      // if this tooltip persists, wait for time-to-live duration before closing
      this.hideTimeout = setTimeout(() => {
        this.element.style.opacity = '0';

        // wait for animations and then remove the tooltip from the DOM
        this.animationTimeout = setTimeout(() => {
          this.element.remove();
          clearTimeout(this.animationTimeout);
        }, 200);

        clearTimeout(this.hideTimeout);
      }, this.tipPersistDuration || 0);
    }
  }

  /**
   * Positions the tooltip element relative to the specified target element and in compliance with the `tipPosition` @Input()
   *
   * @param {HTMLElement} targetElement the element that the tooltip will be positioned relative to
   */
  positionTooltip(targetElement: HTMLElement) {
    const width = targetElement.offsetWidth;
    const height = targetElement.offsetHeight;
    const top = targetElement.getBoundingClientRect().top + window.scrollY;
    const bottom = top + height;
    const left = targetElement.getBoundingClientRect().left;
    const right = left + width;

    const positionTop = () => {
      this.element.style.top = Math.max(10, (top - this.element.offsetHeight - 8)) + 'px';

      // center horizontally
      const centeredLeft = Math.max(10, left - ((this.element.offsetWidth - width) / 2));
      this.element.style.left = centeredLeft + 'px';

      // set text alignment
      this.element.style.textAlign = 'center';

      // @ts-ignore set triangle styles
      this.triangleElement.style = `
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 6px;
        border-color: ${this.tipStyle === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'} transparent transparent transparent;
        position: absolute;
        left: ${left + (targetElement.offsetWidth / 2) - 6 - centeredLeft}px;
        margin: auto;
        bottom: -12px;
      `;
    };

    const positionRight = () => {
      if (window.innerWidth - (right + 8 + this.element.offsetWidth) > 10) {
        this.element.style.left = (right + 8) + 'px';
      } else {
        this.element.style.left = 'auto';
        this.element.style.right = '10px';
      }

      // center vertically
      this.element.style.top = top - ((this.element.offsetHeight - height) / 2) + 'px';

      // set text alignment
      this.element.style.textAlign = 'left';

      // @ts-ignore set triangle styles
      this.triangleElement.style = `
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 6px;
        border-color: transparent ${this.tipStyle === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'} transparent transparent;
        position: absolute;
        top: 0;
        bottom: 0;
        margin: auto;
        left: -12px;
      `;
    };

    const positionLeft = () => {
      this.element.style.left = Math.max(10, (left - this.element.offsetWidth - 8)) + 'px';
      // center vertically
      this.element.style.top = top - ((this.element.offsetHeight - height) / 2) + 'px';

      // set text alignment
      this.element.style.textAlign = 'left';

      // @ts-ignore set triangle styles
      this.triangleElement.style = `
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 6px 0 6px 6px;
        border-color: transparent transparent transparent ${this.tipStyle === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
        position: absolute;
        top: 0;
        bottom: 0;
        margin: auto;
        right: -6px;
      `;
    };

    const positionBottom = () => {
      if (window.innerHeight - (bottom + 8 + this.element.offsetHeight) > 10) {
        this.element.style.top = (bottom + 8) + 'px';
      } else {
        // this.element.style.top = 'auto';
        this.element.style.bottom = '10px';
      }
      // center horizontally
      const centeredLeft = Math.max(10, left - ((this.element.offsetWidth - width) / 2));
      this.element.style.left = centeredLeft + 'px';

      // set text alignment
      this.element.style.textAlign = 'center';

      // @ts-ignore set triangle styles
      this.triangleElement.style = `
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 6px 6px 6px;
        border-color: transparent transparent ${this.tipStyle === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'} transparent;
        position: absolute;
        left: ${left + (targetElement.offsetWidth / 2) - 6 - centeredLeft}px;
        margin: auto;
        top: -6px;
      `;
    };

    // position the tooltip in accordance with the specified `tipPosition` parameter
    switch (this.tipPosition) {
      case 'top':
        positionTop();
        break;
      case 'right':
        positionRight();
        break;
      case 'bottom':
        positionBottom();
        break;
      case 'left':
        positionLeft();
        break;
      default:
        this.tipPosition = 'top';
        positionTop();
        console.error('Error! `' + this.tipPosition + '` isn\'t a valid position! Using `top` instead!');
    }
  }

  ngOnDestroy() {
    // if the target element is destroyed, remove the tooltip
    this.hideTooltip();
  }
}
