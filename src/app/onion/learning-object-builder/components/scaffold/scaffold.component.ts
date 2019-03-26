import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BuilderStore } from '../../builder-store.service';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-scaffold',
  templateUrl: './scaffold.component.html',
  styleUrls: ['./scaffold.component.scss']
})
export class ScaffoldComponent implements OnInit {
  @Input() learningObject: LearningObject;
  // boolean to indicate if edit is selected for the list
  @Input() editContent = true;

  // array to obtain children IDs
  childrenIDs: string[] = [];

  children: any;
  constructor(private store: BuilderStore) {}

  ngOnInit() {
    this.store.getChildren().then((kiddos) => {
      this.children = kiddos;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    // change the index of the child that has been moved in the array used for display
    moveItemInArray(this.children, event.previousIndex, event.currentIndex);

    // get the ids of the children in children array
    this.children.forEach(kid => this.childrenIDs.push(kid._id));

    // set the ids of children to the same order as the childrenIDs
    this.store.setChildren(this.childrenIDs);
  }
}


