import { Component, Input, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LearningObject } from '@entity';
import { Grid } from './grid';

@Component({
  selector: 'clark-details-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements AfterViewInit {
  @Input() learningObject: LearningObject;

  @Inject(PLATFORM_ID) platformId: string;

  canvas;

  @ViewChild('splashWrapper') splashWrapperElement: ElementRef<HTMLElement>;

  constructor() { }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // execute this code only in the browser
      this.canvas = document.querySelector('.details-splash canvas');
    }

    if (this.canvas) {
      Grid.init(this.canvas, this.splashWrapperElement.nativeElement);
    }
  }

}
