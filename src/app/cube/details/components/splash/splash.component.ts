import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LearningObject } from '@entity';
import { Grid } from './grid';

@Component({
  selector: 'clark-details-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements AfterViewInit {
  @Input() learningObject: LearningObject;

  @Input() col1 = 1100;
  @Input() col2 = 300;

  @ViewChild('splashWrapper') splashWrapperElement: ElementRef<HTMLElement>;

  constructor() { }

  ngAfterViewInit() {
    Grid.init(this.splashWrapperElement.nativeElement);
  }

}
