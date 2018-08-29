import {
  Directive,
  ComponentFactoryResolver,
  ViewContainerRef,
  Input,
  HostListener,
  ComponentRef,
  ApplicationRef,
  Injector,
  EmbeddedViewRef,
  OnDestroy
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';
@Directive({
  selector: '[tip]'
})

export class TipDirective implements OnDestroy {
  @Input('tip') tip: string;
  @Input() tipTitle: string;
  @Input() tipLocation: string;
  @Input() tipDelay: number;
  @Input() tipDisabled = 'false';
  @Input() tipTheme: string;

  parent: HTMLElement;
  tooltip: ComponentRef<TooltipComponent>;
  isShown: boolean;
  isHover: boolean;
  timeout: any;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.isShown = false;
    if (!this.tipDelay) { this.tipDelay = 0; }
  }

  /*
  * Method triggered on hover
  * Waits for delay and sets props to tip
  */
  @HostListener('mouseenter')
  showTip() {
    if (this.tipDisabled == 'false') {
      if (this.isShown === false) {
        this.isHover = true;
        this.timeout =
          setTimeout(() => {
            if (this.isHover === true) {
              this.setProps();
            }
          }, this.tipDelay);
      }
    }

  }

  /*
  * Helper Method
  * Builds tooltip component from a component factory and sets inputs to component
  */
  // TODO: Update to take a tip object
  setProps() {
    // create injectable tooltip componen
    this.tooltip = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent).create(this.injector);
    // attach component to angular's component tree (DOES NOT ADD TO DOM)
    this.appRef.attachView(this.tooltip.hostView);

    // set props
    this.tooltip.instance.parent = this.viewContainerRef.element.nativeElement;
    this.tooltip.instance.location = this.tipLocation;
    this.tooltip.instance.theme = this.tipTheme;
    this.tooltip.instance.text = this.tip;
    this.tooltip.instance.title = this.tipTitle;

    // append element to DOM
    const domElem = (this.tooltip.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.isShown = true;
  }


  /*
  * Method triggered on focus lost
  * Destroys instance of tooltip component
  */
  @HostListener('window:scroll')
  @HostListener('mouseleave')
  hideTip() {
    this.isHover = false;
    clearTimeout(this.timeout);
    if (this.isShown === true) {
      this.appRef.detachView(this.tooltip.hostView);
      this.tooltip.destroy();
      this.isShown = false;
    }
  }

  ngOnDestroy() {
    // if element directive is "on" is destroyed, remove tooltip
    this.hideTip();
  }
}
