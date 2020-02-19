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
import { LearningObjectService } from '../learning-object.service';

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
  showDeleteLibraryItemModal = false;
  changelogs = [];
  changelogLearningObject;
  libraryItemToDelete;
  lastPageNumber;
  currentPageNumber = 1;
  currentNotificationsPageNumber = 1;
  lastNotificationsPageNumber;

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
    private learningObjectService: LearningObjectService,
  ) { }

  ngOnInit() {
    this.loadCart();
    this.getNotifications(this.currentNotificationsPageNumber);
  }

  async loadCart() {
    try {
      this.loading = true;
      const libraryItemInformation = await this.cartService.getCart(this.currentPageNumber, 10);
      this.libraryItems = libraryItemInformation.cartItems;
      this.lastPageNumber = libraryItemInformation.lastPage;
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

  async getNotifications(page: number) {
    console.log(page);
    const result = await this.user.getNotifications(this.authService.user.username, page, 5);
    this.notifications = result.notifications;
    this.lastNotificationsPageNumber = result.lastPage;
    this.currentNotificationsPageNumber = page;
  }

  async deleteNotification(notificationID: any) {
    await this.user.deleteNotification(this.authService.user.username, notificationID);
    await this.getNotifications(this.currentPageNumber);
  }

  async removeItem() {
    try {
      await this.cartService.removeFromCart(this.libraryItemToDelete.cuid);
      this.libraryItems = (await this.cartService.getCart(1, 10)).cartItems;
      this.showDeleteLibraryItemModal = false;
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

  goToNotification(notification: any) {
    const parsedDetailsPath = notification.link.split('/');
    console.log(parsedDetailsPath);
    this.router.navigate(['/details/', parsedDetailsPath[2], parsedDetailsPath[3]]);
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

  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
  }

  toggleDeleteLibraryItemModal(val: boolean) {
    this.showDeleteLibraryItemModal = val;
  }

  /**
   * Opens the Change Log modal for a specified learning object and fetches its change logs
   */
  async openViewAllChangelogsModal(notification: any) {
    this.changelogLearningObject = await this.learningObjectService.getLearningObject(
      notification.attributes.learningObjectAuthorUsername,
      notification.attributes.cuid,
      notification.attributes.version
    );
    if (!this.openChangelogModal) {
      this.loadingChangelogs = true;
      try {
        this.changelogs = await this.changelogService.fetchAllChangelogs({
          userId: notification.attributes.learningObjectAuthorID,
          learningObjectCuid: notification.attributes.cuid,
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

  async changeLibraryItemPage(pageNumber: number) {
    console.log(pageNumber);
    const libraryItemInformation = await this.cartService.getCart(pageNumber, 10);
    this.libraryItems = libraryItemInformation.cartItems;
    this.lastPageNumber = libraryItemInformation.lastPage;
    this.currentPageNumber = pageNumber;

    console.log(this.lastPageNumber);
    console.log(this.currentPageNumber);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
