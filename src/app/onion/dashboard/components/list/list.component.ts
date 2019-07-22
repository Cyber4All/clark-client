import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LearningObject } from '@entity';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ChangelogService } from 'app/core/changelog.service';
import { AuthService } from 'app/core/auth.service';
import { ToasterService } from 'app/shared/toaster';
import { BehaviorSubject } from 'rxjs';
import { CollectionService } from 'app/core/collection.service';
@Component({
  selector: 'clark-dashboard-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('listItem', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),
        query(':enter', [
          stagger('60ms', [
            animate('500ms 200ms ease', style({opacity: 1}))
          ])
        ], {optional: true})
      ])
    ]),
  ]
})
export class ListComponent {
  @Input() showOptions: boolean;
  @Input() learningObjects: LearningObject[];
  @Input() title: string;
  @Output() applyFilters: EventEmitter<any> = new EventEmitter();
  filters: Map<string, boolean> = new Map();
  filterMenuDown: boolean;

  // Changelogs
  openChangelogModal: boolean;
  loadingChangelogs: boolean;
  changelogLearningObject: LearningObject;
  changelogs: [];

  // side panel
  focusedLearningObject: LearningObject;
  sidePanelController$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // submission
  submitToCollection = false;

  selected: Map<string, { index: number; object: LearningObject }> = new Map();
  allSelected = false;

  constructor(
    private changelogService: ChangelogService,
    private auth: AuthService,
    private notificationService: ToasterService,
    private cd: ChangeDetectorRef,
    private collectionService: CollectionService,
  ) {}



  toggleFilterMenu(value) {
    this.filterMenuDown = value;
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleFilter(filter: string) {
    if (this.filters.get(filter)) {
      this.filters.delete(filter);

    } else {
      this.filters.set(filter, true);
    }
    this.applyFilters.emit(this.filters);
  }

  clearFilters() {
    this.filters.clear();
    this.applyFilters.emit(this.filters);
  }

  /**
   * Publishes a learning object and adds it to a specified collection
   * @param collection {string} the name of the collection to add this learning object to
   */
  async addToCollection(collection?: string) {
    if (collection) {
      this.collectionService.submit({
        userId: this.focusedLearningObject.author.id,
        learningObjectId: this.focusedLearningObject.id,
        collectionName: collection,
      }).then(() => {
        this.focusedLearningObject.status = LearningObject.Status.WAITING;
        this.focusedLearningObject.collection = collection;
        this.cd.detectChanges();
      }).catch (err => {
        // error
        console.error(err);
        this.notificationService.notify(
          'Error!',
          `Error submitting learning object to ${collection} collection!`,
          'bad',
          'far fa-times'
        );
      });
    } else {
      console.error('No collection defined!');
    }

    this.submitToCollection = false;
  }

  /**
   * Cancel a submission while in waiting status
   * @param l {DashboardLearningObject} learning object to be unpublished
   */
  cancelSubmission(l: LearningObject) {
    this.collectionService.unsubmit({
      learningObjectId: l.id,
      userId: l.author.id,
    }).then(async () => {
      l.status = LearningObject.Status.UNRELEASED;
      this.cd.detectChanges();
    }).catch(err => {
      console.error(err);
    });
  }


  /**
   * Opens the Change Log modal for a specified Learning Object and fetches the appropriate change logs
   *
   * @param {string} learningObjectId the id of the Learning Object for which to fetch change logs
   * @memberof DashboardComponent
   */
  async openViewAllChangelogsModal(learningObjectId: string) {
    this.openChangelogModal = true;
    this.loadingChangelogs = true;
    this.changelogLearningObject = this.learningObjects.find(learningObject => learningObject.id === learningObjectId);
    try {
      this.changelogs =  await this.changelogService.fetchAllChangelogs({
        userId: this.changelogLearningObject.author.id,
        learningObjectId: this.changelogLearningObject.id,
      });
    } catch (error) {
      let errorMessage;

      if (error.status === 401) {
        // user isn't logged-in, set client's state to logged-out and reload so that the route guards can redirect to login page
        this.auth.logout();
      } else {
        errorMessage = 'We encountered an error while attempting to retrieve change logs for this Learning Object. Please try again later.';
      }

      this.notificationService.notify('Error!', errorMessage, 'bad', 'far fa-times');
    }

    this.loadingChangelogs = false;
  }

  /**
   * Closes any open change log modals
   *
   * @memberof DashboardComponent
   */
  closeChangelogsModal() {
    this.openChangelogModal = false;
    this.changelogs = undefined;
  }

   /**
   * Open the Learning Object's information in a side panel
   *
   * @memberof DashboardComponent
   */
  openLearningObjectSidePanel(event: LearningObject) {
    this.focusedLearningObject = event;
    this.cd.detectChanges();
    this.sidePanelController$.next(true);
  }

  /**
   * Returns a boolean indicating whether or not all Learning Objects are selected
   *
   * @readonly
   * @type {boolean}
   * @memberof OldDashboardComponent
   */
  get areAllSelected(): boolean {
    return this.allSelected && this.selected.size === this.learningObjects.length;
  }

  /**
   * Selects all learning objects
   */
  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selected = new Map(
        // @ts-ignore
        this.learningObjects.map((x, i) => [x.id, { index: i, object: x }])
      );
      this.cd.detectChanges();
    } else {
      this.selected = new Map();
    }
  }
}
