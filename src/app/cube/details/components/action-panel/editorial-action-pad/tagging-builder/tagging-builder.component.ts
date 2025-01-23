import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-tagging-builder',
  templateUrl: './tagging-builder.component.html',
  styleUrls: ['./tagging-builder.component.scss']
})
export class TaggingBuilderComponent implements OnInit {

  @Input() learningObject: LearningObject
  currentTab = 'topics'
  constructor() { }

  ngOnInit(): void {
    console.log(this.learningObject)
  }

}
