import {
  Directive,
  ComponentFactoryResolver,
  ViewContainerRef,
  Input,
  HostListener,
  ComponentRef,
  ApplicationRef,
  Injector,
  EmbeddedViewRef
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';
@Directive({
  selector: '[tip]'
})

export class TipDirective {
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
    this.tooltip = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent).create(this.injector);
    this.appRef.attachView(this.tooltip.hostView);
    this.tooltip.instance.parent = this.viewContainerRef.element.nativeElement;
    this.tooltip.instance.location = this.tipLocation;
    this.tooltip.instance.theme = this.tipTheme;
    this.tooltip.instance.text = this.tip;
    this.tooltip.instance.title = this.tipTitle;

    const domElem = (this.tooltip.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);

    this.isShown = true;
  }


  /*
  * Method triggered on focus lost
  * Destroys instance of tooltip component
  */
  @HostListener('window:scroll', ['$event'])
  @HostListener('mouseleave')
  hideTip(event) {
    this.isHover = false;
    clearTimeout(this.timeout);
    if (this.isShown === true) {
      this.appRef.detachView(this.tooltip.hostView);
      this.tooltip.destroy();
      this.isShown = false;
    }
  }
}
