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

  //boolean to indicate if edit is selected for the list 
  editContent = false; 

  constructor() { }

  ngOnInit() {  
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.learningObject.children, event.previousIndex, event.currentIndex);
  }

  //toggle between edit and list view of children 
  toggle(){
    this.editContent = !this.editContent;
  }
}


