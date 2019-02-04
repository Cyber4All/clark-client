import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'; 
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-scaffold',
  templateUrl: './scaffold.component.html',
  styleUrls: ['./scaffold.component.scss']
})
export class ScaffoldComponent implements OnInit {
  @Input() learningObject: LearningObject;
  constructor() { }

  ngOnInit() {
  }
  children = [
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.children, event.previousIndex, event.currentIndex);
  }

}
