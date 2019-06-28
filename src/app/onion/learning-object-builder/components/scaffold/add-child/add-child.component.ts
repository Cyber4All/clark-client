import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-add-child',
  templateUrl: './add-child.component.html',
  styleUrls: ['./add-child.component.scss']
})
export class AddChildComponent implements OnInit {
  // the child that is currently being edited
  @Input() child: LearningObject;
  @Input() currentChildren: LearningObject[];
  // emits the child that is to be added to the children array
  @Output() childToAdd: EventEmitter<{}> = new EventEmitter();

  childrenSearchString = ' ';
  children: LearningObject[];
  loading: boolean;

  lengths = ['nanomodule', 'micromodule', 'module', 'unit', 'course'];

  constructor(
    private learningObjectService: LearningObjectService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    setTimeout(async() => {
      this.children = await this.getLearningObjects();
    }, 1000);
  }

  /**
   * Retrieve the list of candidate children and filter out the current children
   * as well as the object that is currently being edited
   * @param filters
   */
  async getLearningObjects(filters?: any): Promise<LearningObject[]> {
    this.loading = true;
    return this.learningObjectService
      .getLearningObjects(this.auth.username, filters)
      .then((children: LearningObject[]) => {
        this.loading = false;
        const indx = this.lengths.indexOf(this.child.length);
        const childrenLengths = this.lengths.slice(0, indx);
        this.currentChildren.forEach(child => {
          children.forEach(kid => {
            const idx = children.indexOf(kid);
            if (!childrenLengths.includes(kid.length)) {
              children.splice(idx, 1);
            }
            if (child.id === kid.id) {
              children.splice(idx, 1);
            }
            if (this.child.id === kid.id) {
              children.splice(idx, 1);
            }
          });
        });
        return children;
      });
  }
  /**
   * Takes the index of the LO within the array and emits it to the parent
   * and also removes it from the array of candidate children for the LO
   * @param index
   */
  addChildToList(index) {
    this.childToAdd.emit(this.children[index]);
    this.children.splice(index, 1);
  }

  search() {
    setTimeout(async() => {
      this.children = await this.getLearningObjects(this.childrenSearchString);
    }, 1000);
  }

}
