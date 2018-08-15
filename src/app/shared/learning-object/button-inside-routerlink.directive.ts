import {Directive, Input, OnInit, HostListener} from '@angular/core';
import {RouterLink} from '@angular/router';

@Directive({
    selector: ':not(a)[extendedRouterLink]'
})
export class ExtendedRouterLinkDirective extends RouterLink implements OnInit {
  @Input() extendedRouterLink;

  ngOnInit() {
    this.routerLink = this.extendedRouterLink;
  }

  @HostListener('click', ['$event.target'])
  onclick(el): boolean {
    return el.nodeName === 'BUTTON'
      || el.parentElement.nodeName === 'BUTTON'
      || el.parentElement.nodeName === 'svg'
      ? false : super.onClick();
  }
}
