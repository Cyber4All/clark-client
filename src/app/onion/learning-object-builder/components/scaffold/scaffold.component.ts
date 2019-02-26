import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'; 
import { BuilderStore } from '../../builder-store.service';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-scaffold',
  templateUrl: './scaffold.component.html',
  styleUrls: ['./scaffold.component.scss']
})
export class ScaffoldComponent implements OnInit {
  @Input() learningObject: LearningObject; 
  //boolean to indicate if edit is selected for the list 
  @Input() editContent: boolean;

  children: any;
  constructor(private store: BuilderStore) {}

  ngOnInit() {
    this.store.getChildren().then((kiddos) => {
      this.children = kiddos;
    }); 
  }

  ngChange(){ 
    //this.store.setChildren(this.learningObject, this.children); 
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.children, event.previousIndex, event.currentIndex); 
    this.store.setChildren(this.children);
  }

  //toggle between edit and list view of children 
  toggle(){
   this.editContent = !this.editContent;
  }
}


