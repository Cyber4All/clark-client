import {
  Component,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  ContentChild,
  ElementRef,
  EmbeddedViewRef,
  ComponentRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { TeleporterDestinationComponent } from './teleporter-destination/teleporter-destination.component';

/**
 * This component serves to take content through projection and render it at the document root instead of in it's nested position.
 */
@Component({
  selector: 'clark-teleporter',
  template: ''
})
export class TeleporterComponent implements AfterViewInit, OnDestroy {
  // grab the #teleporterPayload element to be used as the rendered body body
  @ContentChild('teleporterPayload', {static: false}) content: ElementRef;

  viewer: ComponentRef<TeleporterDestinationComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    // create a new PopupViewerComponent and project our content into it
    this.viewer = this.componentFactoryResolver
      .resolveComponentFactory(TeleporterDestinationComponent)
      .create(this.injector, [[this.content.nativeElement]]);

    // detect changes in the hostview so that :enter animations will work
    this.viewer.hostView.detectChanges();

    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(this.viewer.hostView);

    // append viewer element to DOM
    const domElem = (this.viewer.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  ngOnDestroy() {
    // destroy TeleporterDestinationComponent when this component is destroyed
    this.appRef.detachView(this.viewer.hostView);
    this.viewer.destroy();
  }
}
