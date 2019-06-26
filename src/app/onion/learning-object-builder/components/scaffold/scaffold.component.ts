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
  @Input() editContent: boolean;

  // array to obtain children IDs
  childrenIDs: string[] = [];
  childrenConfirmationMessage: string;
  childrenConfirmation: boolean;

  children: LearningObject[];
  constructor(private store: BuilderStore) {}

  ngOnInit() {
    this.store.getChildren().then((kiddos) => {
      this.children = kiddos;
    });
    this.childrenConfirmation = false;
  }

  /**
   * Function to allow for drag drop implementation for reordering of children
   * @param CdkDragDrop<string[]>
   */
  drop(event: CdkDragDrop<string[]>) {
    // change the index of the child that has been moved in the array used for display
    moveItemInArray(this.children, event.previousIndex, event.currentIndex);

    // get the ids of the children in children array
    this.children.forEach(kid => this.childrenIDs.push(kid.id));

    // set the ids of children to the same order as the childrenIDs
    this.store.setChildren(this.childrenIDs);
  }

  /**
   * Toggle the delete and add buttons on and off
   */
  toggleAddDelete() {
    this.editContent = !this.editContent;
  }

  /**
   * Triggers the delete confirmation modal for the child selected for deletion
   * @param index of the LO selected for deletion
   */
  deleteButton(index) {
    this.childrenConfirmationMessage = `Just to confirm, you want to delete '
        ${this.children[index].name}' as a child of '${this.learningObject.name}'?`;

    this.toggleConfirmationModal(true);
  }

  /**
   * Sends request to update the children array of the Learning Object
   * @param index of the LO selected for deletion
   */
  deleteChild(index) {
    this.toggleConfirmationModal(false);
    // remove the child that was selected to be deleted
    this.children.splice(index, 1);

    // set childrenIDs equal to the children array and set children 
    this.children.forEach(kid => this.childrenIDs.push(kid.id));
    // this.store.setChildren(this.childrenIDs);

    // if deleted child was last child toggle off editContent because there is no longer content to edit
    if (this.children.length === 0) {
      this.editContent = false;
    }
  }
  /**
   * Toggles the confirmation modal based on the boolean val
   * @param val
   */
  toggleConfirmationModal(val?: boolean) {
    this.childrenConfirmation = val;
  }
}


