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
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface SidePanelOptions {
  padding: boolean;
  showExitColor: boolean;
  exitButtonColor: 'white' | 'black';
}

@Directive({
  selector: '[panel]'
})
export class PanelDirective implements OnInit, OnDestroy {
  viewer: ComponentRef<SidePanelViewerComponent>;

  @Input() contentWidth: number;
  @Input() options: SidePanelOptions;
  @Input() defaultCloseParam: any;

  @Output() close = new EventEmitter<any>();

  animationElement: HTMLElement;

  private destroyed$ = new Subject<void>();

  constructor(
    private host: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private builder: AnimationBuilder,
  ) {
  }

  /**
   * Listen for escape key and close the panel if it's open
   *
   * @param {KeyboardEvent} event
   * @memberof PanelDirective
   */
  @HostListener('window:keydown', ['$event']) handleKeyDown(event: KeyboardEvent) {
    if (event.key === '13') {
      this.doClose();
    }
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
    this.viewer.instance.defaultCloseParam = this.defaultCloseParam;

    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(this.viewer.hostView);

    // append viewer element to DOM
    const domElem = (this.viewer.hostView as EmbeddedViewRef<any>)
    .rootNodes[0] as HTMLElement;

    this.host.nativeElement.addEventListener('SidePanelCloseEvent', (e: CustomEvent) => {
      this.close.emit(e.detail);
      this.host.nativeElement.removeEventListener('SidePanelCloseEvent', (_: CustomEvent) => { });
    });

    document.body.appendChild(domElem);
    this.animationElement = domElem.querySelectorAll('.side-panel')[0] as HTMLElement;

    // animate on
    const player = this.animate(slideIn);
    player.onDone(() => {
      player.destroy();
    });
  }

  doClose() {
    if (typeof this.defaultCloseParam !== 'undefined') {
      this.close.emit(this.defaultCloseParam);
    } else {
      this.close.emit();
    }
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

      this.destroyed$.next();
      this.destroyed$.unsubscribe();
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
