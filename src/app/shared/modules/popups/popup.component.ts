import { takeUntil } from 'rxjs/operators';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  ContentChild,
  OnDestroy,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  ComponentRef,
  EmbeddedViewRef,
  HostListener,
  Input
} from '@angular/core';
import { Subject } from 'rxjs';
import { PopupViewerComponent } from './popup-viewer/popup-viewer.component';

@Component({
  selector: 'clark-popup',
  template: `
    <div class="clark-popup"></div>
  `
})
export class PopupComponent implements OnInit, AfterViewInit, OnDestroy {
  // grab the #popupInner element to be used as the popup body
  @ContentChild('popupInner') content: ElementRef;

  // specify whether or not the modal should float
  @Input() floating: boolean;

  // event emitter to signal the popups closure to it's origin component
  @Output() closed: EventEmitter<void> = new EventEmitter();

  // instance of PopupViewerComponent to be populated from the content variable and injected into the DOM
  viewer: ComponentRef<PopupViewerComponent>;

  componentDestroyed$: Subject<void> = new Subject();

  private triggerElement: ElementRef<HTMLElement>;

  // listen for keyup event and, if it's the escape key, close the popup
  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.close();
    }
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) { }

  ngOnInit() {
    // set the triggerElement to the last-focused-element if it exists in the DOM
    this.triggerElement = new ElementRef(document.querySelector('[lastFocusedElement]'));

    if (!this.triggerElement || !this.triggerElement.nativeElement) {
      // no last-focused-element existed on the DOM, set the trigger element instead to the document's activeElement
      this.triggerElement = new ElementRef(document.activeElement as HTMLElement);
    }
  }

  ngAfterViewInit() {
    // create a new PopupViewerComponent and project our content into it
    this.viewer = this.componentFactoryResolver
      .resolveComponentFactory(PopupViewerComponent)
      .create(this.injector, [[this.content.nativeElement]]);


    this.viewer.instance.floating = this.floating;

    // detect changes in the hostview so that :enter animations will work
    this.viewer.hostView.detectChanges();

    // listen for the viewer to signal a close event and clean up here
    this.viewer.instance.close
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe(() => {
        this.close();
      });

    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(this.viewer.hostView);

    // append viewer element to DOM
    const domElem = (this.viewer.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    /*
     This component appends it's payload (the HTML for the context menu) to the DOM, meaning
     it's inserted as the very last element in the <body> tag. As a result of this, when
     tabbing out of the last popup item, some browsers assume the user has tabbed through
     the entire document and thus focus some piece of the browser's UI, preventing javascript from refocusing
     a piece of the document. When a user tabs away from the last popup item, we need to close the popup and refocus
     its trigger element (the button/element that triggered the popup) to allow the user to continue tabbing through the document.
     This dummy element is rendered invisible and 500px off the screen to the left, and provides another element in the <body> after the
     popup. Now, when the user tabs away from the last popup item, the input is focused, allowing JS to redirect the focus
     event to the original anchor element. The dummy input is promptly removed from the DOM in the cleanup step.
   */
    const dummyNode = document.createElement('input');
    // hide the input immediately on render
    dummyNode.setAttribute('id', 'popupDummyInput');
    dummyNode.setAttribute('class', 'dummy-input');
    document.body.appendChild(dummyNode);
  }

  ngOnDestroy() {
    document.getElementById('popupDummyInput').remove();
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();

    // remove dynamic component when this component is destroyed
    this.close();

    this.triggerElement.nativeElement.focus();
  }

  close() {
    this.closed.emit();
    this.appRef.detachView(this.viewer.hostView);
    this.viewer.destroy();
  }
}
