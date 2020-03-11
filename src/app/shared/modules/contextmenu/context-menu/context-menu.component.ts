import {
  Component,
  AfterViewInit,
  ContentChild,
  Output,
  EventEmitter,
  Input,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  EmbeddedViewRef,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { ContextMenuViewerComponent } from '../context-menu-viewer/context-menu-viewer.component';

/**
 * The purpose of this component is to wrap the content of a context menu and provide an interface
 * between it's parent component (the controller) and the service, This component is never shown
 * on the screen.
 */
@Component({
  selector: 'clark-context-menu',
  template: '',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextMenuComponent implements AfterViewInit, OnDestroy {
  @ContentChild('contextMenu', /* TODO: add static flag */ {}) menuElement: ElementRef<HTMLElement>;

  @Input() anchor?: HTMLElement;

  @Input() offset: { top: number; left: number } = { top: 0, left: 0 };

  @Output() id: EventEmitter<string> = new EventEmitter();
  @Output() close: EventEmitter<void> = new EventEmitter();

  viewer;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    // create a new ContextMenuViewerComponent and project our content into it
    this.viewer = this.componentFactoryResolver
      .resolveComponentFactory(ContextMenuViewerComponent)
      .create(this.injector, [[this.menuElement.nativeElement]]);

    // pass the close event emitter to the viewer component
    this.viewer.instance.close = this.close;

    // detect changes in host view for :enter animations
    this.viewer.hostView.detectChanges();

    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(this.viewer.hostView);

    // append viewer element to DOM
    const domElem = (this.viewer.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // for each list element in menu, tab index it and give it a role of button
    domElem.querySelectorAll('li').forEach(el => {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
    });

    // calculate the position if an anchor element was given
    if (this.anchor) {
      const [top, left] = this.calculatePosition(this.anchor, this.offset);
      domElem.style.top = top + 'px';
      domElem.style.left = left + 'px';

      const contextElement = domElem.querySelector(
        '.context-menu'
      ) as HTMLElement;

      contextElement.style.top = top + 'px';
      contextElement.style.left = left + 'px';

      // hide the element before appending so that we can calculate it's width and move it if necessary
      contextElement.style.visibility = 'hidden';

      // add the element to the DOM
      document.body.appendChild(domElem);

      // check width
      if (left + contextElement.offsetWidth + 20 >= window.innerWidth) {
        contextElement.style.left =
          left -
          contextElement.offsetWidth +
          this.anchor.offsetWidth -
          this.offset.left * 2 +
          'px';
      }

      // check height
      if (top + contextElement.offsetHeight + 20 >= window.innerHeight) {
        contextElement.style.top =
          top -
          contextElement.offsetHeight -
          this.anchor.offsetHeight -
          this.offset.top +
          'px';
      }

      domElem.remove();
      contextElement.style.visibility = 'visible';
      document.body.appendChild(domElem);

      /*
        This component appends it's payload (the HTML for the context menu) to the DOM, meaning
        it's inserted as the very last element in the <body> tag. As a result of this, when
        tabbing out of the last context-menu item, some browsers assume the user has tabbed through
        the entire document and thus focus some piece of the browser's UI, preventing javascript from refocusing
        a piece of the document. When a user tabs away from the last menu item, we need to close te menu and refocus
        its anchor element (the button/element that triggered the menu) to allow the user to continue tabbing through the document.
        This dummy element is rendered invisible and 500px off the screen to the left, and provides another element in the <body> after the
        context menu. Now, when the user tabs away from the last context menu item, the input is focused, allowing JS to redirect the focus
        event to the original anchor element. The dummy input is promptly removed from the DOM in the cleanup step.
      */
      const dummyNode = document.createElement('input');
      // hide the input immediately on render
      dummyNode.setAttribute('id', 'contextMenuDummyInput');
      dummyNode.setAttribute('class', 'dummy-input');
      document.body.appendChild(dummyNode);

      // focus the first element in the context menu for accessibility
      const firstElement = domElem.querySelector('li');
      firstElement.focus();

      // listen for the user to tab out of the context menu and close the menu
      domElem.querySelectorAll('li:first-child, li:last-child').forEach(el => {

        el.addEventListener('blur', (event: FocusEvent) => {

          if (!event.relatedTarget || (event.relatedTarget as HTMLElement).parentElement !== firstElement.parentElement) {
            this.close.emit();
          }
        });
      });

      // mark the anchor element has the last focused element, since the menu will disappear whenever an element is selected
      this.anchor.setAttribute('lastFocusedElement', 'true');

    } else {
      console.error(
        'Error! Please provide an anchor element for all context menus!'
      );
    }
  }

  ngOnDestroy() {
    this.close.emit();
    this.appRef.detachView(this.viewer.hostView);
    this.viewer.destroy();

    // focus the anchor element (the element that triggered the context menu) for accessibility
    this.anchor.focus();

    // remove the dummy node from the DOM since we don't need it anymore
    document.getElementById('contextMenuDummyInput').remove();

    setTimeout(() => {
      // wait 1 second and remove the lastFocusedElement attribute from the anchor element
      this.anchor.removeAttribute('lastFocusedElement');
    }, 1000);
  }

  /**
   * Calculates position for context menu when anchored near an element by the elements position and the offset parameter
   * @param anchor {HTMLElement} the element that this context menu should be positioned near
   * @param offset {top: number, left: number} object containing distance (in pixels) menu should be from element for top and left
   */
  private calculatePosition(
    anchor: HTMLElement,
    offset: { top: number; left: number } = { top: 10, left: 10 }
  ): [number, number] {
    const boundingBox = anchor.getBoundingClientRect();
    return [boundingBox.bottom + offset.top, boundingBox.left + offset.left];
  }
}
