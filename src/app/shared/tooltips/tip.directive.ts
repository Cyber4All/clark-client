import { Tip } from './tip';
import { Directive, ComponentFactoryResolver, ViewContainerRef, Input, HostListener, ComponentRef } from '@angular/core';
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
  // text: string;
  // title: string;
  parent: HTMLElement;
  tooltip: ComponentRef<TooltipComponent>;
  isShown: boolean;
  isHover: boolean;
  timeout: any;
  constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef) {
    this.parent = this.viewContainerRef.element.nativeElement;
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
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent);
    this.tooltip = this.viewContainerRef.createComponent(componentFactory);
    this.tooltip.instance.parent = this.parent;
    this.tooltip.instance.location = this.tipLocation;
    this.tooltip.instance.theme = this.tipTheme;
    this.tooltip.instance.text = this.tip;
    this.tooltip.instance.title = this.tipTitle;
    // this.tip = JSON.parse(this.tip);
    // console.log(typeof this.tip)
    // if (this.tip instanceof Tip){
    //     this.tooltip.instance.title = this.tip.title;
    //     this.tooltip.instance.text =this.tip.text
    // } else {
    //     this.tooltip.instance.text = this.tip;
    // }
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
      this.tooltip.destroy();
      this.isShown = false;
    }
  }
}
