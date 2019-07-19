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

  filters: any;

  constructor(
    private history: HistoryService,
    private router: Router,
    private navbar: NavbarService,
    private learningObjectService: LearningObjectService,
    public auth: AuthService
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
      this.releasedLearningObjects = await this.getLearningObjects({status: LearningObject.Status.RELEASED});
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
   * Retrieves an array of learningObjects to populate the draft and released list of learning objects
   * @param filters
   * @param query
   */
  async getLearningObjects(filters?: any, text?: string): Promise<LearningObject[]> {
    this.loading = true;
    return this.learningObjectService
    .getLearningObjects(this.auth.username, filters, text)
    .then((children: LearningObject[]) => {
      this.loading = false;
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
    this.loading = true;
    return this.learningObjectService
    .getDraftLearningObjects(this.auth.username, filters, text)
    .then((children: LearningObject[]) => {
      this.loading = false;
      return children;
    });
  }

  /**
   * Performs a search on the users released and working Learning Objects
   * @param text
   */
  async performSearch(text: string) {
    this.releasedLearningObjects = await this.getLearningObjects({status: LearningObject.Status.RELEASED}, text);
    this.workingLearningObjects = await this.getDraftLearningObjects(text);
  }
}
