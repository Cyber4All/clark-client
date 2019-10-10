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
  HostListener,
  Output,
  EventEmitter
} from '@angular/core';
import { SidePanelViewerComponent } from './side-panel-viewer/side-panel-viewer.component';
import { AnimationBuilder, AnimationStyleMetadata, AnimationAnimateMetadata, AnimationPlayer } from '@angular/animations';
import { slideIn, slideOut } from './panel.animations';
import { take } from 'rxjs/operators';

export interface SidePanelOptions {
  padding: boolean;
}

@Directive({
  selector: '[panel]'
})
export class PanelDirective implements OnInit, OnDestroy {
  viewer: ComponentRef<SidePanelViewerComponent>;

  @Input() contentWidth: number;
  @Input() options: SidePanelOptions;

  @Output() close = new EventEmitter<void>();

  animationElement: HTMLElement;

  constructor(
    private host: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private builder: AnimationBuilder,
  ) { }

  /**
   * Listen for escape key and close the panel if it's open
   *
   * @param {KeyboardEvent} event
   * @memberof PanelDirective
   */
  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    this.close.emit();
  }

  ngOnInit() {
    // remove the original element from the DOM so that we don't show it twice
    this.host.nativeElement.remove();

    // initialize the viewer object with a new instance of SidePanelViewerComponent
    this.viewer = this.componentFactoryResolver
    .resolveComponentFactory(SidePanelViewerComponent)
    .create(this.injector, [[this.host.nativeElement]]);

    this.viewer.instance.contentWidth = this.contentWidth;
    this.viewer.instance.options = this.options;

    this.viewer.instance.close = this.close;

    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(this.viewer.hostView);

    // append viewer element to DOM
    const domElem = (this.viewer.hostView as EmbeddedViewRef<any>)
    .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);
    this.animationElement = domElem.querySelectorAll('.side-panel')[0] as HTMLElement;

    // animate on
    const player = this.animate(slideIn);
    player.onDone(() => {
      player.destroy();
    });
  }

  ngOnDestroy() {
    // animate off
    const player = this.animate(slideOut);

    // wait for animations
    setTimeout(() => {
      // detach the view from the Angular component tree and destroy the view
      this.appRef.detachView(this.viewer.hostView);
      this.viewer.destroy();
      player.destroy();
    }, 650);
  }

  /**
   * Animate the side panel with the specified animation  metadata
   *
   * @param {((AnimationStyleMetadata | AnimationAnimateMetadata)[])} animation
   * @memberof PanelDirective
   */
  animate(animation: (AnimationStyleMetadata | AnimationAnimateMetadata)[]): AnimationPlayer {
    // animate on
    const factory = this.builder.build(animation);
    const player = factory.create(this.animationElement);

    player.play();

    return player;
  }
}
