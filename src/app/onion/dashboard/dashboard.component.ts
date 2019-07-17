import { Component, OnInit } from '@angular/core';
import { HistoryService } from 'app/core/history.service';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarService } from 'app/core/navbar.service';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'clark-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  lastLocation: NavigationEnd;
  activeIndex = 0;
  loading: boolean;
  releasedLearningObjects: LearningObject[];
  workingLearningObjects: LearningObject[];

  action$: Subject<number> = new Subject();

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
    // retrieve other status learning objects
    setTimeout(async() => {
      this.workingLearningObjects = await this.getLearningObjects({status: ['unreleased', 'proofing', 'review', 'rejected', 'waiting']});
    }, 1100);
    // retrieve released learning objects
    setTimeout(async() => {
      this.releasedLearningObjects = await this.getLearningObjects({status: ['released']});
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
   * Navigates back, either to the home page or to the previous non-onion page
   */
  navigateBack() {
    let url = '/home';

    if (this.lastLocation && !this.lastLocation.url.includes('onion')) {
      url = this.lastLocation.url;
    }

    this.router.navigateByUrl(url);
  }


  async getLearningObjects(filters?: any, query?: any): Promise<LearningObject[]> {
    this.loading = true;
    return this.learningObjectService
    .getLearningObjects(this.auth.username, filters, query)
    .then((children: LearningObject[]) => {
      return children;
    });
  }
}
