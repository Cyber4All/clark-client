import {
  Directive,
  ElementRef,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  EmbeddedViewRef,
  HostListener
} from '@angular/core';
import { SidePanelViewerComponent } from './side-panel-viewer/side-panel-viewer.component';
import { BehaviorSubject } from 'rxjs';

export interface SidePanelOptions {
  padding: boolean;
}

@Directive({
  selector: '[panel]'
})
export class PanelDirective implements OnInit, OnDestroy {
  viewer: ComponentRef<SidePanelViewerComponent>;

  @Input() controller$: BehaviorSubject<boolean>;
  @Input() contentWidth: number;
  @Input() options: SidePanelOptions;

  constructor(
    private host: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
  ) { }

  /**
   * Listen for escape key and close the panel if it's open
   *
   * @param {KeyboardEvent} event
   * @memberof PanelDirective
   */
  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    if (this.controller$.getValue() && event.keyCode === 27) {
      this.controller$.next(false);
    }
  }

  ngOnInit() {
    // remove the original element from the DOM so that we don't show it twice
    this.host.nativeElement.remove();

    // initialize the viewer object with a new instance of SidePanelViewerComponent
    this.viewer = this.componentFactoryResolver
    .resolveComponentFactory(SidePanelViewerComponent)
    .create(this.injector, [[this.host.nativeElement]]);

    this.viewer.instance._controller$ = this.controller$;
    this.viewer.instance.contentWidth = this.contentWidth;
    this.viewer.instance.options = this.options;

    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(this.viewer.hostView);

    // append viewer element to DOM
    const domElem = (this.viewer.hostView as EmbeddedViewRef<any>)
    .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);
  }

  ngOnDestroy() {
    // wait for animations
    setTimeout(() => {
      // detach the view from the Angular component tree and destroy the view
      this.appRef.detachView(this.viewer.hostView);
      this.viewer.destroy();
    }, 650);
  }
}
