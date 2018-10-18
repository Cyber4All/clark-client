import { Component, OnInit, ContentChild, ElementRef, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'clark-column-wrapper',
  templateUrl: './column-wrapper.component.html',
  styleUrls: ['./column-wrapper.component.scss'],
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
