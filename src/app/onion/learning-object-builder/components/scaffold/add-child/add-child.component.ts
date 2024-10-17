import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { AuthService } from 'app/core/auth-module/auth.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { SearchService } from 'app/core/learning-object-module/search/search.service';

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
    private searchLearningObjectService: SearchService,
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
    const draftObjects = await this.searchLearningObjectService
      .getUsersLearningObjects(this.child.author.username, { ...filters, text: query, draftsOnly: true })
      .then((response: { learningObjects: LearningObject[], total: number }) => {
        const indx = this.lengths.indexOf(this.child.length);
        const childrenLengths = this.lengths.slice(0, indx);
        return response.learningObjects.filter((child: LearningObject) => {
          return (!this.currentChildren.includes(child.id) && childrenLengths.includes(child.length));
        });
      });
    const releasedObjects = await this.searchLearningObjectService
      .getUsersLearningObjects(this.child.author.username, { ...filters, text: query })
      .then((response: { learningObjects: LearningObject[], total: number }) => {
        const indx = this.lengths.indexOf(this.child.length);
        const childrenLengths = this.lengths.slice(0, indx);
        return response.learningObjects.filter((child: LearningObject) => {
          return (!this.currentChildren.includes(child.id) && childrenLengths.includes(child.length));
        });
      });
    this.loading = false;
    return [...draftObjects, ...releasedObjects];
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
