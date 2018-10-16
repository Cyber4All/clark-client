import { Component, OnInit, ContentChild, ElementRef, AfterViewInit, ContentChildren, ViewChild, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate, query, stagger, animateChild } from '@angular/animations';

@Component({
  selector: 'clark-column-wrapper',
  templateUrl: './column-wrapper.component.html',
  styleUrls: ['./column-wrapper.component.scss'],
  animations: [
    trigger('columns', [
      transition('* => *', [
        query(':enter', [
          style({ 'transform': 'translateY(-200px)', opacity: 0 }),
        ], { optional: true }),
        query(':enter', [
          stagger('250ms', [
            animate('450ms ease', style({ 'transform': 'translateY(0px)', opacity: 1 }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger('250ms', [
            animate('450ms ease', style({ 'transform': 'translateY(-200px)', opacity: 0 }))
          ])
        ], { optional: true }),
      ])
    ]),
  ]
})
export class ColumnWrapperComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('columnWrapper') columnWrapper: ElementRef;

  @ContentChild('left') leftCol: ElementRef;
  @ContentChild('main') mainCol: ElementRef;
  @ContentChild('right') rightCol: ElementRef;

  columnOffset: number;
  columnHeight: number;

  constructor() {}

  ngOnInit() {
    // calculate the height of the scroll wrapper
    this.columnOffset = (this.columnWrapper.nativeElement as HTMLElement).offsetTop;
    this.columnHeight = window.innerHeight - this.columnOffset + 30;

    // set overflow of body to hidden to prevent parent scrolling
    if (this.columnHeight >= 560) {
      // this check prevents obsucring the outcomes sidebar
      document.body.style.overflow = 'hidden';
    }
  }

  ngAfterViewInit() {
    // TODO check for right column and adjust mobile threshold here
    // TODO collapse left panel on smaller screens
  }

  ngOnDestroy() {
    document.body.style.overflow = 'visible';
  }

}
