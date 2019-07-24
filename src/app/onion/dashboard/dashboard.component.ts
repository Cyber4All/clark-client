import { Component, OnInit } from '@angular/core';
import { HistoryService } from 'app/core/history.service';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarService } from 'app/core/navbar.service';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { trigger, transition, style, animate, animateChild, query, stagger } from '@angular/animations';

export interface DashboardLearningObject extends LearningObject {
  status: LearningObject.Status;
  parents: string[];
}
@Component({
  selector: 'clark-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('dashboardList', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms 600ms ease-out', style({opacity: 1, transform: 'translateY(-0px)'})),
        query( '@listItem', animateChild(), {optional: true} )
      ]),
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

  constructor(
    private history: HistoryService,
    private router: Router,
    private navbar: NavbarService,
    private learningObjectService: LearningObjectService,
    public auth: AuthService,
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
   * Toggles between the draft tab and the released tab
   */
  toggle() {
    if (this.activeIndex % 2) {
      this.action$.next(-1);
    } else {
      this.action$.next(1);
    }
    this.activeIndex++;
    console.log(this.workingLearningObjects[0]);
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
   * Performs a search on the users released and working Learning Objects
   * @param text
   */
  async performSearch(text: string) {
    this.workingLearningObjects = await this.getDraftLearningObjects(text);
    this.releasedLearningObjects = await this.getReleasedLearningObjects({status: LearningObject.Status.RELEASED}, text);
    this.loading = false;
  }

    /**
   * Delete a learning object after asking confirmation.
   *
   * This is a generator function.
   * The confirmation modal is shown from the markup by setting the deleteConfirmation variable
   * to the return value of this function and then immediately calling the .next() function,
   * IE deleteConfirmation = delete(l); deleteConfirmation.next();
   * To confirm or deny the confirmation, call deleteConfirmation.next(true) or deleteConfirmation.next(false)
   * @param objects {DashboardLearningObject[]} list of objects to be deleted
   
  async *delete(objects: LearningObject[] | LearningObject) {
    const confirm = yield;
    if (!confirm) {
      return;
    }

    if (!Array.isArray(objects) || objects.length === 1) {
      const object = Array.isArray(objects) ? objects[0] : objects;
      this.learningObjectService
        .delete(object.name , object.author.username)
        .then(async () => {
          this.notificationService.notify(
            'Done!',
            'Learning Object deleted!',
            'good',
            'far fa-check'
          );
          this.learningObjects = await this.getLearningObjects();
          this.clearSelected();
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
      // multiple deletion
      const canDelete = objects.filter(s => [LearningObject.Status.UNRELEASED, LearningObject.Status.REJECTED].includes(s.status));

      if (canDelete.length) {
        const authorUsername = canDelete[0].author.username;
        this.learningObjectService
          // TODO: Verify selected is an array of names
          .deleteMultiple(canDelete.map(s => s.name), authorUsername)
          .then(async () => {
            this.clearSelected();
            if (canDelete.length === objects.length) {
              this.notificationService.notify(
                'Done!',
                'Learning Objects deleted!',
                'good',
                'far fa-check'
              );
            } else {
              this.notificationService.notify(
                'Warning!',
                'Some learning objects couldn\'t be deleted! You can only delete learning objects that haven\'t been published.',
                'warning',
                'fas fa-exclamation'
              );
            }
            this.learningObjects = await this.getLearningObjects();
          })
          .catch(err => {
            console.log(err);
            this.notificationService.notify(
              'Error!',
              'Learning Objects could not be deleted!',
              'bad',
              'far fa-times'
            );
          });
      } else {
        this.notificationService.notify(
          'Warning!',
          'Learning objects couldn\'t be deleted! You can only delete learning objects that haven\'t been published.',
          'warning',
          'fas fa-exclamation'
        );
      }
    }

    this.deleteConfirmation = undefined;

    return;
  } */
}
