import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LearningObject } from '@entity';
import { Grid } from './grid';

@Component({
  selector: 'clark-details-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  @Input() learningObject: LearningObject;

  @Input() col1: number = 1100;
  @Input() col2: number = 300;

  @ViewChild('splashWrapper') splashWrapperElement: ElementRef<HTMLElement>;

  constructor() { }

  ngOnInit() {
    Grid.init(this.splashWrapperElement.nativeElement);
  }

}
