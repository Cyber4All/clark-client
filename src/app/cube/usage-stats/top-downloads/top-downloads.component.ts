import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';

@Component({
  selector: 'clark-top-downloads',
  templateUrl: './top-downloads.component.html',
  styleUrls: ['./top-downloads.component.scss']
})
export class TopDownloadsComponent implements OnInit {
  @Input() learningObjects: LearningObject[];
  @Input() loading: boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
