import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BuilderStore } from '../../builder-store.service';
import { LearningObject } from '@entity';
import { UriRetrieverService } from 'app/core/learning-object-module/uri-retriever.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'clark-scaffold',
  templateUrl: './scaffold.component.html',
  styleUrls: ['./scaffold.component.scss']
})
export class ScaffoldComponent implements OnInit {
  @Input() learningObject: LearningObject;

  // array to obtain children IDs
  childrenIDs: string[] = [];
  childrenConfirmationMessage: string;
  ariaLabel: string;

  loadingChildrenError: boolean;

  children: LearningObject[];

  deleteIndex: number;

  // flags
  loading: boolean;
  childrenConfirmation: boolean;
  isAddingChild: boolean;
  // boolean to indicate if edit is selected for the list
  @Input() editContent: boolean;

  @ViewChild('addChildButton') addChildButton: ElementRef;
  @ViewChild('teleporterPayload') teleporterPayload: ElementRef;

  @HostListener('window:click', ['$event']) handleClickAway(event: MouseEvent) {
    this.toggleAddChild(false);
  }

  @HostListener('keyup', ['$event']) handleEscape(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.toggleAddChild(false);
    }
  }
  constructor(
    private store: BuilderStore,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private uriRetriver: UriRetrieverService,
  ) { }

  ngOnInit() {
    this.childrenConfirmation = false;
    this.ariaLabel = 'Add and delete Children';

    // if the Learning Object can have children, attempt to load them
    if (this.learningObject.length !== LearningObject.Length.NANOMODULE) {
      this.loading = true;
      this.store.getChildren().then(kiddos => {
        this.children = kiddos;
        this.children.forEach(kid => this.childrenIDs.push(kid._id));
        this.loading = false;
      }).catch(error => {
        this.loading = false;
        this.loadingChildrenError = true;
      });
    }
  }

  /**
   * Add child to children array
   */
  addToChild(child: LearningObject) {
    if (this.children) {
      // if we already have a children array defined

      // add child to the children array
      this.children.unshift(child);

      // add child to the childrenIDs array
      this.childrenIDs.unshift(child._id);
    } else {
      // if we DO NOT already have a children array defined

      // add child to the children array
      this.children = [child];

      // add child to the childrenIDs array
      this.childrenIDs = [child._id];
    }


    // send request to the service to set children
    this.store.setChildren(this.childrenIDs);
  }

  /**
   * Function to allow for drag drop implementation for reordering of children
   *
   * @param CdkDragDrop<string[]>
   */
  drop(event: CdkDragDrop<string[]>) {
    // change the index of the child that has been moved in the array used for display
    moveItemInArray(this.children, event.previousIndex, event.currentIndex);

    this.childrenIDs = [];
    // get the ids of the children in children array
    this.children.forEach(kid => this.childrenIDs.push(kid._id));

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
   *
   * @param index of the LO selected for deletion
   */
  deleteButton(index) {
    this.deleteIndex = index;
    this.childrenConfirmationMessage = `Just to confirm, you want to remove '
        ${this.children[index].name}' as a child of '${this.learningObject.name
      }'?`;

    this.toggleConfirmationModal(true);
  }

  /**
   * Sends request to update the children array of the Learning Object
   */
  async deleteChild() {
    this.toggleConfirmationModal(false);
    // remove the child that was selected to be deleted
    this.children.splice(this.deleteIndex, 1);

    // set childrenIDs equal to the children array
    this.childrenIDs = [];
    this.children.forEach(kid => this.childrenIDs.push(kid._id));
    await this.store.fetch(this.learningObject.cuid);
    await this.store.setChildren(this.childrenIDs, true);

    // if deleted child was last child toggle off editContent because there is no longer content to edit
    if (this.children.length === 0) {
      this.editContent = false;
    }

    // get the children again to get current childrens array
    await this.store.getChildren();
  }
  /**
   * Toggles the confirmation modal based on the boolean val
   *
   * @param val
   */
  toggleConfirmationModal(val?: boolean) {
    this.childrenConfirmation = val;
  }
  /**
   * Toggles the child modal
   */
  toggleAddChild(value: boolean = true) {
    if (value) {
      // [left, top]
      const position = [
        (this.addChildButton.nativeElement as HTMLElement).getBoundingClientRect()
          .left,
        (this.addChildButton.nativeElement as HTMLElement).getBoundingClientRect()
          .top
      ];

      position[0] +=
        (this.addChildButton.nativeElement as HTMLElement).offsetLeft + 100;

      position[1] +=
        (this.addChildButton.nativeElement as HTMLElement).offsetHeight - 43;

      // add the payload to the DOM
      this.isAddingChild = value;
      // enable the add/delete mode since the user is currently adding children
      this.editContent = true;

      // detect changes to populate the ViewChild with the correct element
      this.cd.detectChanges();

      // set the correct coordinates for the payload to render
      this.renderer.setStyle(
        this.teleporterPayload.nativeElement,
        'left',
        position[0] + 'px'
      );
      this.renderer.setStyle(
        this.teleporterPayload.nativeElement,
        'top',
        position[1] + 'px'
      );
      this.renderer.setStyle(
        this.teleporterPayload.nativeElement,
        'width',
        (this.addChildButton.nativeElement as HTMLElement).offsetWidth +
        50 +
        'px'
      );

      this.renderer.addClass(
        this.teleporterPayload.nativeElement,
        'add-child--active'
      );
    } else {
      // remove the payload from the DOM
      this.isAddingChild = value;
    }
  }
}
