import {
  Component,
  Input,
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

/**
 * This component serves to take content through projection and render it at the document root instead of in it's nested position.
 */
@Component({
  selector: 'clark-teleporter',
  templateUrl: './teleporter.component.html',
  styleUrls: ['./teleporter.component.scss']
})
export class TeleporterComponent implements AfterViewInit, OnDestroy {
  // grab the #teleporterPayload element to be used as the rendered body body
  @ContentChild('teleporterPayload') content: ElementRef;

  // true if this component is the root-component (ie, should this component render it's content or teleport it's content to root)
  @Input() render: boolean;

  viewer: ComponentRef<TeleporterComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    // if this component is the teleporter, create a second instance of this component,
    // set it`s render flag to true, and render it at document root
    if (!this.render) {
      // create a new PopupViewerComponent and project our content into it
      this.viewer = this.componentFactoryResolver
        .resolveComponentFactory(TeleporterComponent)
        .create(this.injector, [[this.content.nativeElement]]);

      // set the new instance's render flag to true so that we don't infinitely create instances of the component
      this.viewer.instance.render = true;

      // detect changes in the hostview so that :enter animations will work
      this.viewer.hostView.detectChanges();

      // attach component to angular's component tree (DOES NOT ADD TO DOM)
      this.appRef.attachView(this.viewer.hostView);

      // append viewer element to DOM
      const domElem = (this.viewer.hostView as EmbeddedViewRef<any>)
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }
  }

  ngOnDestroy() {
    if (!this.render) {
      // destroy render TeleporterComponent when initial non-render component is destroyed
      this.appRef.detachView(this.viewer.hostView);
      this.viewer.destroy();
    }
  }
}
