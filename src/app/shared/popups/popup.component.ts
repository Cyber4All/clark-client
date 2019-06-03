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

  // listen for keyup event and, if it's the escape key, close the popup
  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      this.close();
    }
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngOnInit() {}

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
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();

    // remove dynamic component when this component is destroyed
    this.close();
  }

  close() {
    this.closed.emit();
    this.appRef.detachView(this.viewer.hostView);
    this.viewer.destroy();
  }
}
