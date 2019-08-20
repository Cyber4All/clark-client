import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { LearningObject } from '@entity';
import { Grid } from './grid';

@Component({
  selector: 'clark-details-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit, AfterViewInit {
  @Input() learningObject: LearningObject;

  constructor() { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    Grid.drawGrid();
  }

}
