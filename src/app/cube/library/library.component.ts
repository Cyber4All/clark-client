import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartV2Service } from 'app/core/cartv2.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user.service';
import { RatingService } from 'app/core/rating.service';
import { ChangelogService } from 'app/core/changelog.service';

@Component({
  selector: 'clark-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy{

  loading: boolean;
  serviceError: boolean;
  libraryItems: LearningObject[] = [];
  downloading = [];
  destroyed$ = new Subject<void>();
  canDownload = false;
  notifications: { text: string, timestamp: string, link: string, attributes: any }[];
  notificationPages = {};
  notificationPageKeys = [];
  showDownloadModal = false;
  openChangelogModal = false;
  loadingChangelogs = false;
  changelogs = [];
  changelogLearningObject;

  get notPagesYo() {
    return Object.entries(this.notificationPages).map(x => x[1]);
  }

  constructor(
    public cartService: CartV2Service,
    private toaster: ToastrOvenService,
    private authService: AuthService,
    private router: Router,
    private user: UserService,
    private ratings: RatingService,
    private changelogService: ChangelogService,
  ) { }

  ngOnInit() {
    this.loadCart();
    this.getNotifications();
  }

  async loadCart() {
    try {
      this.loading = true;
      this.libraryItems = await this.cartService.getCart(1, 10);
      this.libraryItems.map(async (libraryItem: LearningObject) => {
        const ratings = await this.getRatings(libraryItem);
        if (ratings) {
          libraryItem['avgRating'] = ratings.avgValue;
        }
      });
      this.loading = false;
    } catch (e) {
      this.toaster.error('Error!', 'Unable to load your library. Please try again later.');
      this.serviceError = true;
      this.loading = false;
    }
  }

  async getNotifications() {
    this.notifications = await this.user.getNotifications(this.authService.user.username);
    this.setNotificationPages();
  }

  async deleteNotification(notificationID: any) {
    console.log(notificationID);
    // await this.user.deleteNotification(this.authService.user.username, notificationID);
  }

  async removeItem(event: MouseEvent, object: LearningObject) {
    event.stopPropagation();
    try {
      this.libraryItems = await this.cartService.removeFromCart(object.cuid);
    } catch (e) {
      console.log(e);
    }
  }

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.downloading[index] = true;
    this.cartService.downloadLearningObject(
        object.author.username,
        object.cuid,
        object.version
      ).pipe(
      takeUntil(this.destroyed$))
      .subscribe(finished => {
        if (finished) {
          this.downloading[index] = false;
        }
      });

    this.showDownloadModal = true;
  }

  goToItem(object: LearningObject) {
    this.router.navigate(['/details/', object.author.username, object.cuid]);
  }

  async getRatings(learningObject: LearningObject) {
    const { author, cuid, version } = learningObject;
    const params = {
      username: author.username,
      CUID: cuid,
      version,
    };
    const ratings = await this.ratings.getLearningObjectRatings(params);
    return ratings;
  }

  async getChangelogs() {

  }

  setNotificationPages() {
    const perPageCount = 5;
    const pageCount = Math.floor(this.notifications.length / perPageCount);
    const trailingNotificationsCount = this.notifications.length % perPageCount;
    let lastSavedIndex = 0;

    for (let i = 0; i < pageCount; i++) {
      for (let j = lastSavedIndex; j < lastSavedIndex + 5; j++) {
        this.notificationPages[i] ? this.notificationPages[i].push(this.notifications[j]) : this.notificationPages[i] = [this.notifications[j]];
      }
      lastSavedIndex = lastSavedIndex + 5;
    }

    for (let x = 0; x < trailingNotificationsCount; x++) {
      lastSavedIndex += 1;
      this.notificationPages[pageCount] = this.notifications[lastSavedIndex - 1];
    }

    this.notificationPageKeys = Object.keys(this.notificationPages).map(element => parseInt(element, 10));
  }

  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
  }

  /**
   * Opens the Change Log modal for a specified learning object and fetches its change logs
   */
  async openViewAllChangelogsModal(notification: any) {
    const libraryItem = this.libraryItems.find(libraryItem => libraryItem.cuid === notification.attributes.cuid);
    this.changelogLearningObject = libraryItem;
    if (!this.openChangelogModal) {
      this.loadingChangelogs = true;
      try {
        
        this.changelogs = await this.changelogService.fetchAllChangelogs({
          userId: libraryItem.author.id,
          learningObjectCuid: libraryItem.cuid,
          minusRevision: true,
        });
        
      } catch (error) {
        let errorMessage;

        if (error.status === 401) {
          // user isn't logged-in, set client's state to logged-out and reload so that the route guards can redirect to login page
          this.authService.logout();
        } else {
          errorMessage = `We encountered an error while attempting to
          retrieve change logs for this Learning Object. Please try again later.`;
        }
        this.toaster.error('Error!', errorMessage);
      }
      this.loadingChangelogs = false;
      this.openChangelogModal = true;
    }
  }

 /**
  * Closes any open change log modals
  */
 closeChangelogsModal() {
  this.openChangelogModal = false;
  this.changelogs = undefined;
}

  private async checkAccessGroup() {
    this.canDownload = this.authService.hasReviewerAccess();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
