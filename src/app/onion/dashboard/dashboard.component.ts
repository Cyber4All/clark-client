import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HistoryService, HistorySnapshot } from 'app/core/history.service';
import { NavigationEnd, ActivatedRoute, Router } from '@angular/router';
import { NavbarService } from 'app/core/navbar.service';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { AuthService } from 'app/core/auth.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { CollectionService } from 'app/core/collection.service';
import { ChangelogService } from 'app/core/changelog.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { takeUntil, take } from 'rxjs/operators';

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
export class DashboardComponent implements OnInit, OnDestroy {
  lastLocation: NavigationEnd;
  activeIndex = 0;
  loading: boolean;
  releasedLearningObjects: LearningObject[];
  workingLearningObjects: LearningObject[];

  action$: BehaviorSubject<number> = new BehaviorSubject(this.activeIndex);

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
  currentlySubmittingObject: LearningObject;

  // delete
  objectsToDelete: LearningObject[];

  historySnapshot: HistorySnapshot;

  sidePanelPromiseResolver: Promise<any>;

  checkQueryParams$ = new Subject<void>();

  destroyed$ = new Subject<void>();

  constructor(
    private history: HistoryService,
    private route: ActivatedRoute,
    private router: Router,
    private navbar: NavbarService,
    private learningObjectService: LearningObjectService,
    public auth: AuthService,
    private collectionService: CollectionService,
    private changelogService: ChangelogService,
    public notificationService: ToastrOvenService,
    private cd: ChangeDetectorRef,
  ) {
    this.navbar.hide();
  }

  async ngOnInit() {
    this.loading = true;

    // retrieve draft status learning objects
    setTimeout(async() => {
      await this.getDraftLearningObjects();
    }, 1100);
    // retrieve released learning objects
    setTimeout(async() => {
      await this.getReleasedLearningObjects({status: LearningObject.Status.RELEASED});
      this.loading = false;
    }, 1100);

    this.route.queryParams.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(async params => {
      const cuid = params.activeLearningObject;
      const version = parseInt(params.version, 10);

      let p = new Promise(resolve => resolve());

      if (cuid && version >= 0) {
        // we know we can attempt to open the sidepanel, now to see if we've finished loading released Learning Objects
        if (!this.releasedLearningObjects) {
          p = new Promise(resolve => {
            this.checkQueryParams$.pipe(
              take(1)
            ).subscribe(() => {
              resolve();
            });
          });
        }

        p.then(() => {
          // now we know we're finished loading the released objects
          const object = this.releasedLearningObjects.filter(o => {
            return o.cuid === cuid && o.version === version;
          });

          if (!object || !object.length) {
            this.router.navigate(['./']);
          } else {
            // navigate to the specified Learning Object and open the side panel
            if (!(this.activeIndex % 2)) {
              this.toggle();
            }

            this.focusedLearningObject = object[0];
          }
        });
      }
    });

    this.historySnapshot = this.history.snapshot();
  }

  /**
   * Retrieves an array of learningObjects to populate the draft list of learning objects
   * This will only retrieve the drafts and will not retrieve any revisions of a learning object
   * @param filters
   * @param text
   */
  async getDraftLearningObjects(filters?: any, text?: string): Promise<void> {
    if (Object.prototype.toString.call(filters) === '[object String]') {
      text = filters;
    }

    this.workingLearningObjects = await this.learningObjectService
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
  async getReleasedLearningObjects(filters?: any, text?: string): Promise<void> {
    this.releasedLearningObjects = await this.learningObjectService
      .getLearningObjects(this.auth.username, filters, text)
      .then((children: LearningObject[]) => {
        return children;
      });

      this.checkQueryParams$.next();
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
    this.filters = filters;
    const filter = Array.from(filters.keys());
    if (filter.length !== 0) {
      this.getDraftLearningObjects({status: filter});
    } else {
      this.getDraftLearningObjects();
    }
  }

  /**
   * Performs a search on the users released and working Learning Objects
   * @param text
   */
  performSearch(text: string) {
    this.getReleasedLearningObjects({status: LearningObject.Status.RELEASED}, text);
    this.getDraftLearningObjects(this.filters, text);
  }

  // SUBMISSION AND CANCEL SUBMISSION LOGIC

   /**
   * Submits learning object to collection
   * @param event
   */
  submitLearningObjectToCollection(event: LearningObject) {
    this.currentlySubmittingObject = event;
    this.submitToCollection = true;
  }

   /**
   * Cancel a submission while in waiting status
   * @param l {LearningObject} learning object to be unpublished
   */
  cancelSubmission(l: LearningObject): Promise<void> {
    return this.collectionService.unsubmit({
      learningObjectId: l.id,
      userId: l.author.id,
    }).then(async () => {
      l.status = LearningObject.Status.UNRELEASED;
      this.cd.detectChanges();
      this.notificationService.success('Done!', 'Learning Object Submission Cancelled!');
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

      this.notificationService.error('Error!', errorMessage);
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
  async deleteObjects(objects: any): Promise<void> {
    this.objectsToDelete = objects;
    const canDelete = this.objectsToDelete.filter(
      s => [LearningObject.Status.UNRELEASED, LearningObject.Status.REJECTED].includes(s.status)
    );
    if (canDelete.length === 1) {
      return this.learningObjectService.delete(canDelete[0].author.username, canDelete[0].id)
      .then(async () => {
        this.notificationService.success('Done!', 'Learning Object deleted!');
        await this.getDraftLearningObjects();
      })
      .catch(err => {
        console.log(err);
        this.notificationService.error('Error!', 'Learning Object could not be deleted!');
      });
    } else if (canDelete.length > 1) {
      const objectsToDeleteIDs = [];
      canDelete.forEach(object => {
        objectsToDeleteIDs.push(object.id);
      });
      return this.learningObjectService.deleteMultiple(objectsToDeleteIDs, this.objectsToDelete[0].author.username)
      .then(async () => {
        this.notificationService.success('Done!', 'Learning Objects deleted!');
        await this.getDraftLearningObjects();
      })
      .catch(err => {
        console.log(err);
        this.notificationService.error('Error!', 'Learning Object could not be deleted!');
      });
    } else {
      this.notificationService.error('Error!', 'Selected Learning Objects could not be deleted!');

      return Promise.reject();
    }
  }

  createRevision(object: LearningObject) {
    this.sidePanelPromiseResolver = this.learningObjectService.createRevision(object.cuid, object.author.username).then(() => {
      this.getReleasedLearningObjects({status: LearningObject.Status.RELEASED});
    });
  }

  submitRevision(object: LearningObject) {
    this.submitLearningObjectToCollection(object);
  }

  submitRevisionPromiseHandler(submitted: boolean) {
    this.sidePanelPromiseResolver = new Promise((resolve, reject) => {
      if (submitted) {
        resolve();
      } else {
        reject();
      }
    });
  }

  cancelRevisionSubmission(object: LearningObject) {
    this.sidePanelPromiseResolver = this.cancelSubmission(object);
  }

  deleteRevision(object: LearningObject) {
    if (true) {
      this.sidePanelPromiseResolver = this.deleteObjects([object]).then(() => {
        this.getReleasedLearningObjects({status: LearningObject.Status.RELEASED});
      });
    }
  }

  closeSidePanel(event: any) {
    this.focusedLearningObject = undefined;

    if (event && event.shouldRoute) {
      // rewind to the history snapshot to take us to wherever we were before entering the dashboard
      this.historySnapshot.rewind();

      // now navigate back to the dashboard so that the history stack is correct
      this.router.navigate([], { queryParams: {} });
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
