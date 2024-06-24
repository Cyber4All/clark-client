import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { AuthService } from 'app/core/auth-module/auth.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'clark-add-child',
  templateUrl: './add-child.component.html',
  styleUrls: ['./add-child.component.scss']
})
export class AddChildComponent implements OnInit, OnDestroy {
  // the child that is currently being edited
  @Input() child: LearningObject;
  @Input() currentChildren: string[];
  // emits the child that is to be added to the children array
  @Output() childToAdd: EventEmitter<{}> = new EventEmitter();

  children: LearningObject[];
  loading: boolean;

  childrenSearchString: string;
  searchString$: BehaviorSubject<string> = new BehaviorSubject('');
  componentDestroyed$: Subject<void> = new Subject();

  lengths = ['nanomodule', 'micromodule', 'module', 'unit', 'course'];

  constructor(
    private learningObjectService: LearningObjectService,
    public auth: AuthService,
  ) {
    this.searchString$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(650)
      )
      .subscribe(() => {
        this.search();
      });
  }

  async ngOnInit() {
    this.children = await this.getLearningObjects();
  }

  /**
   * Retrieve the list of candidate children and filter out the current children
   * as well as the object that is currently being edited
   *
   * @param filters
   */
  async getLearningObjects(filters?: any, query?: string): Promise<LearningObject[]> {
    this.loading = true;
    return this.learningObjectService
      .getLearningObjects(this.child.author.username, filters, query, this.child._id)
      .then((children: LearningObject[]) => {
        this.loading = false;
        const indx = this.lengths.indexOf(this.child.length);
        const childrenLengths = this.lengths.slice(0, indx);
        children = children.filter(child => (!this.currentChildren.includes(child._id) && childrenLengths.includes(child.length)));
        return children;
      });
  }
  /**
   * Takes the index of the LO within the array and emits it to the parent
   * and also removes it from the array of candidate children for the LO
   *
   * @param index
   */
  addChildToList(child, index) {
    this.childToAdd.emit(child);
    this.children.splice(index, 1);
  }

  async search() {
    this.children = await this.getLearningObjects(null, this.childrenSearchString);
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
