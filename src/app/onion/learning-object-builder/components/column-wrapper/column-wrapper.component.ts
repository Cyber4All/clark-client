import { Component, OnInit, ContentChild, ElementRef, AfterViewInit, ContentChildren } from '@angular/core';

@Component({
  selector: 'clark-column-wrapper',
  templateUrl: './column-wrapper.component.html',
  styleUrls: ['./column-wrapper.component.scss']
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
