import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HistoryService } from 'app/core/history.service';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarService } from 'app/core/navbar.service';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { AuthService } from 'app/core/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { CollectionService } from 'app/core/collection.service';
import { ChangelogService } from 'app/core/changelog.service';
import { ToasterService } from 'app/shared/toaster/toaster.service';

@Component({
  selector: 'clark-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('dashboardList', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('200ms 400ms ease-out', style({opacity: 1, transform: 'translateY(-0px)'})),
      ]),
    ]),
    trigger('Loading', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('400ms 500ms ease-out', style({opacity: 1, transform: 'translateY(-0px)'})),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0px)'}),
        animate('200ms ease-out', style({opacity: 0, transform: 'translateY(20px)'})),
      ])
    ]),
  ]
})
export class DashboardComponent implements OnInit {
  lastLocation: NavigationEnd;
  activeIndex = 0;
  loading: boolean;
  releasedLearningObjects: LearningObject[];
  workingLearningObjects: LearningObject[];

  action$: Subject<number> = new Subject();

  // structure of filters is {status: string[]}
  filters: object;

  // Changelogs
  openChangelogModal: boolean;
  loadingChangelogs: boolean;
  changelogLearningObject: LearningObject;
  changelogs: [];
  learningObjects: LearningObject[];

  // submission
  submitToCollection: boolean;

  // side panel
  focusedLearningObject: LearningObject;
  sidePanelController$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // delete
  objectsToDelete: LearningObject[];


  constructor(
    private history: HistoryService,
    private router: Router,
    private navbar: NavbarService,
    private learningObjectService: LearningObjectService,
    public auth: AuthService,
    private collectionService: CollectionService,
    private changelogService: ChangelogService,
    public notificationService: ToasterService,
    private cd: ChangeDetectorRef,
  ) {
    this.navbar.hide();
    this.lastLocation = this.history.lastRoute;
  }

  async ngOnInit() {
    this.loading = true;
    // retrieve draft status learning objects
    setTimeout(async() => {
      this.workingLearningObjects = await this.getDraftLearningObjects();
    }, 1100);
    // retrieve released learning objects
    setTimeout(async() => {
      this.releasedLearningObjects = await this.getReleasedLearningObjects({status: LearningObject.Status.RELEASED});
      this.loading = false;
    }, 1100);
  }

  /**
   * Retrieves an array of learningObjects to populate the draft list of learning objects
   * This will only retrieve the drafts and will not retrieve any revisions of a learning object
   * @param filters
   * @param text
   */
  async getDraftLearningObjects(filters?: any, text?: string): Promise<LearningObject[]> {
    if (Object.prototype.toString.call(filters) === '[object String]') {
      text = filters;
    }
    return this.learningObjectService
    .getDraftLearningObjects(this.auth.username, filters, text)
    .then((children: LearningObject[]) => {
      return children;
    });
  }

   /**
   * Retrieves an array of learningObjects to populate the released list of learning objects
   * @param filters
   * @param query
   */
  async getReleasedLearningObjects(filters?: any, text?: string): Promise<LearningObject[]> {
    return this.learningObjectService
    .getLearningObjects(this.auth.username, filters, text)
    .then((children: LearningObject[]) => {
      return children;
    });
  }
  /**
   * Toggles between the draft tab and the released tab
   */
  toggle() {
    if (this.activeIndex % 2) {
      this.action$.next(-1);
    } else {
      this.action$.next(1);
    }
    this.activeIndex++;
  }

  /**
   * Applys status filters to the draft learning objects list
   * @param filters
   */
  async applyFilters(filters: any) {
    const filter = Array.from(filters.keys());
    if (filter.length !== 0) {
      this.workingLearningObjects = await this.getDraftLearningObjects({status: filter});
    } else {
      this.workingLearningObjects = await this.getDraftLearningObjects();
    }
  }

  /**
   * Navigates back, either to the home page or to the previous non-onion page
   */
  navigateBack() {
    let url = '/home';

    if (this.lastLocation && !this.lastLocation.url.includes('onion')) {
      url = this.lastLocation.url;
    }

    this.router.navigateByUrl(url);
  }

  /**
   * Performs a search on the users released and working Learning Objects
   * @param text
   */
  async performSearch(text: string) {
    this.releasedLearningObjects = await this.getReleasedLearningObjects({status: LearningObject.Status.RELEASED}, text);
    this.workingLearningObjects = await this.getDraftLearningObjects(text);
  }

  // SUBMISSION AND CANCEL SUBMISSION LOGIC

   /**
   * Submits learning object to collection
   * @param event
   */
  submitLearningObjectToCollection(event: LearningObject) {
    this.focusedLearningObject = event;
    this.submitToCollection = true;
  }

   /**
   * Cancel a submission while in waiting status
   * @param l {LearningObject} learning object to be unpublished
   */
  cancelSubmission(l: LearningObject) {
    this.collectionService.unsubmit({
      learningObjectId: l.id,
      userId: l.author.id,
    }).then(async () => {
      l.status = LearningObject.Status.UNRELEASED;
      this.cd.detectChanges();
      this.notificationService.notify(
        'Done!',
        'Learning Object Submission Cancelled!',
        'good',
        'far fa-check'
      );
    }).catch(err => {
      console.error(err);
    });
  }

  // CHANGELOG MODAL LOGIC

   /**
   * Opens the Change Log modal for a specified Learning Object and fetches the appropriate change logs
   *
   * @param {string} learningObjectId the id of the Learning Object for which to fetch change logs
   * @memberof DashboardComponent
   */
  async openViewAllChangelogsModal(learningObjectId: string) {
    this.openChangelogModal = true;
    this.loadingChangelogs = true;
    this.learningObjects = this.workingLearningObjects.concat(this.releasedLearningObjects);
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

  // SIDEPANEL LOGIC
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

  // DELETION LOGIC
  async deleteObjects(objects: any) {
    this.objectsToDelete = objects;
    const canDelete = this.objectsToDelete.filter(
      s => [LearningObject.Status.UNRELEASED, LearningObject.Status.REJECTED].includes(s.status)
    );
    if (canDelete.length === 1) {
      this.learningObjectService.delete(canDelete[0].name, canDelete[0].author.username)
      .then(async () => {
        this.notificationService.notify(
          'Done!',
          'Learning Object deleted!',
          'good',
          'far fa-check'
        );
        this.workingLearningObjects = await this.getDraftLearningObjects();
      })
      .catch(err => {
        console.log(err);
        this.notificationService.notify(
          'Error!',
          'Learning Object could not be deleted!',
          'bad',
          'far fa-times'
        );
      });
    } else if (canDelete.length > 1) {
      const objectsToDeleteNames = [];
      canDelete.forEach(object => {
        objectsToDeleteNames.push(object.name);
      });
      this.learningObjectService.deleteMultiple(objectsToDeleteNames, this.objectsToDelete[0].author.username)
      .then(async () => {
        this.notificationService.notify(
          'Done!',
          'Learning Objects deleted!',
          'good',
          'far fa-check'
        );
        this.workingLearningObjects = await this.getDraftLearningObjects();
      })
      .catch(err => {
        console.log(err);
        this.notificationService.notify(
          'Error!',
          'Learning Object could not be deleted!',
          'bad',
          'far fa-times'
        );
      });
    } else {
      this.notificationService.notify(
        'Error!',
        'Selected Learning Objects could not be deleted!',
        'bad',
        'far fa-times'
      );
    }
  }

  async createRevision(object: LearningObject) {
    const revision = this.learningObjectService.createRevision(object);
    console.log(revision);
  }
}
