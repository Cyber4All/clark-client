import { Component, OnInit, ContentChild, ElementRef, AfterViewInit, ContentChildren } from '@angular/core';
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
export class ColumnWrapperComponent implements OnInit, AfterViewInit {
  @ContentChild('left') leftCol: any;
  @ContentChild('main') mainCol: ElementRef;
  @ContentChild('right') rightCol: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // TODO check for right column and adjust mobile threshold here
    // TODO collapse left panel on smaller screens
    // TODO add animations unless element has permanent attribute
  }

}
