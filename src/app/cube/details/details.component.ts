import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  protected learningObject: LearningObject;

  constructor() { }

  ngOnInit() {
  }

}
