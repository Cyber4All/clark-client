import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { LibraryItem, LibraryService } from 'app/core/library-module/library.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth-module/auth.service';
import { Router } from '@angular/router';
import { LearningObjectRatings, RatingService } from 'app/core/rating-module/rating.service';
import { NotificationService } from 'app/core/notification-module/notification.service';
import { ChangelogService } from 'app/core/learning-object-module/changelog/changelog.service';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';
import { trigger, style, group, transition, animate, query } from '@angular/animations';
import { NavbarService } from 'app/core/client-module/navbar.service';
import { BUNDLING_ROUTES } from 'app/core/learning-object-module/bundling/bundling.routes';

@Component({
  selector: 'clark-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  animations: [
    trigger('slider', [
      transition(':increment', group([
        query(':enter', [
          style({
            transform: 'translateX(100%)',
            opacity: 0,
            zIndex: 1,
            'pointer-events': 'none',
          }),
          animate('0.4s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
        ]),
      ])),
      transition(':decrement', group([
        query(':enter', [
          style({
            transform: 'translateX(-100%)',
            opacity: 1,
            'pointer-events': 'none',
          }),
          animate('0.4s ease-out', style('*'))
        ]),
      ]))
    ])
  ]
})
export class LibraryComponent implements OnInit, OnDestroy {

  @ViewChild('savedList') topOfList: ElementRef;
  loading: boolean;
  serviceError: boolean;
  libraryItems: LibraryItem[] = [];
  downloading = [];
  currentIndex = null;
  destroyed$ = new Subject<void>();
  canDownload = false;
  notifications: { text: string, timestamp: string, link: string, attributes: any }[];
  localNotifications: { text: string, timestamp: string, link: string, attributes: any }[] = [];
  notificationPages = {};
  notificationPageKeys = [];
  showDownloadModal = false;
  openChangelogModal = false;
  loadingChangelogs = false;
  showDeleteLibraryItemModal = false;
  changelogs = [];
  changelogLearningObject;
  libraryItemIdToDelete: string;
  lastPageNumber;
  currentPageNumber = 1;
  currentNotificationsPageNumber = 1;
  lastNotificationsPageNumber = 1;
  notificationCount = 0;
  // Notification Card variables
  notificationCardCount = 0;
  lastIndex = 0;
  firstIndex = 0;


  constructor(
    public libraryService: LibraryService,
    private toaster: ToastrOvenService,
    private authService: AuthService,
    private router: Router,
    private ratingService: RatingService,
    private changelogService: ChangelogService,
    private learningObjectService: LearningObjectService,
    private navbarService: NavbarService,
    private notificationService: NotificationService
  ) { }

  @HostListener('window:resize', ['$event'])
  async getScreenSize() {
    const width = window.innerWidth;
    const previousCardCount = this.notificationCardCount;
    // Mobile devices
    if (width <= 750) {
      this.notificationCardCount = 1;
      // Normal tablets
    } else if (width > 750 && width <= 1050) {
      this.notificationCardCount = 2;
      // Smaller Desktops
    } else if (width > 1050 && width <= 1350) {
      this.notificationCardCount = 3;
    } else if (width > 1350 && width <= 1650) {
      this.notificationCardCount = 4;
      // Bigger Desktops
    } else if (width > 1650) {
      this.notificationCardCount = 5;
    }
    if (previousCardCount !== this.notificationCardCount) {
      if (this.localNotifications.length <= 0) {
        await this.getNotifications(this.currentNotificationsPageNumber);
      }
      this.firstIndex = 0;
      this.lastIndex = this.firstIndex + this.notificationCardCount;
      this.setNotifications(this.firstIndex);
    }
  }

  async ngOnInit() {
    this.navbarService.show();
    this.getScreenSize();
    this.loadLibrary();
  }

  async loadLibrary() {
    try {
      this.loading = true;
      const getLibraryResponse = await this.libraryService.getLibrary({ page: this.currentPageNumber, limit: 10 });

      this.libraryItems = getLibraryResponse.libraryItems;
      this.lastPageNumber = getLibraryResponse.lastPage;

      this.libraryItems.map(async (libraryItem: LibraryItem) => {
        const ratings = await this.getRatings(libraryItem.learningObject);
        if (ratings) {
          libraryItem['avgRating'] = ratings.avgValue;
        }
      });
      this.loading = false;
    } catch (e) {
      console.log(e);
      this.toaster.error('Error!', 'Unable to load your library. Please try again later.');
      this.serviceError = true;
      this.loading = false;
    }
  }

  /**
   * This function retrieves the notifications from Notification service
   *
   * @param apiPage The page that we need to retrieve from Notifications service
   */
  async getNotifications(apiPage: number) {
    /**
     * TODO:  Notification service definitely needs to be refactored. The service itself
     * currently calculates the last page number incorrectly.
     *
     * The last page number should be calculated as follows:
     * (numberOfNotifications / limit) + (numberOfNotifications % limit)
     * Example. int(7 / 5) + 7 % 5 = 1 + 2 = 3 which should actually be 2
     */

    // Get the notifications from the Notification service
    const result = await this.notificationService.getNotifications(this.authService.user.username, apiPage, 5);

    // Add the notifications to the localNotifications array
    this.localNotifications.concat(result.notifications);
    this.lastNotificationsPageNumber = result.lastPage;

    // If the last page is greater than the current page, then we need to get the next page
    if (this.lastNotificationsPageNumber === this.localNotifications.length) {
      this.currentNotificationsPageNumber = this.lastNotificationsPageNumber;
    } else {
      this.currentNotificationsPageNumber = apiPage;
    }
  }

  /**
   * This will set the notifications array according to the number of cards that are to be displayed and
   * the page number the user is currently on.
   * There are 5 cases covered in this function:
   * 1. The index of the localNotifications array being requested is equal to the firstIndex of the notification array
   * 2. The index of the localNotifications array being requested is less than the
   *    first Index and there are more than enough in the array to display
   * 3. The index of the localNotifications array being requested is less than the first Index and there are not enough left in the array
   *    to display
   * 4. The index of the localNotifications array being requested is larger than the array and there are plenty left in the array to show
   * 5. The index of the localNotifications array being requested is larger than the array and there are no enough left
   *    in the array to display
   *
   * @param page The current page that the user is on
   */
  async setNotifications(index: number) {
    if (index === this.firstIndex) {
      this.lastIndex = this.notificationCardCount;
    } else if (index < this.firstIndex && index >= 0) {
      this.goBackNotifications();
    } else if (index > this.firstIndex) {
      await this.goForwardNotifications();
    }
    this.notifications = [];
    this.notifications = this.localNotifications.slice(this.firstIndex, this.lastIndex);
  }

  goBackNotifications() {
    if ((this.firstIndex - this.notificationCardCount >= 0)) {
      this.firstIndex = this.firstIndex - this.notificationCardCount;
      this.lastIndex = this.firstIndex + this.notificationCardCount;
    } else if ((this.firstIndex - this.notificationCardCount <= 0)) {
      this.firstIndex = this.firstIndex - (this.localNotifications.length - this.notificationCardCount);
      this.lastIndex = this.firstIndex + this.notificationCardCount;
    }
  }

  async goForwardNotifications() {
    if ((this.lastIndex + this.notificationCardCount) <= this.localNotifications.length) {
      this.firstIndex = this.firstIndex + this.notificationCardCount;
      this.lastIndex = this.lastIndex + this.notificationCardCount;
    } else if ((this.lastIndex + this.notificationCardCount) >= this.localNotifications.length
      && this.lastIndex !== this.localNotifications.length) {
      if (this.lastNotificationsPageNumber > this.currentNotificationsPageNumber) {
        await this.getNotifications(this.currentNotificationsPageNumber + 1);
      }
      this.firstIndex = this.lastIndex;
      this.lastIndex = this.localNotifications.length;
    }
  }

  async deleteNotification(notification: any) {
    await this.notificationService.deleteNotification(this.authService.user.username, notification.id);
    this.localNotifications = [];
    await this.getNotifications(this.currentPageNumber);
    this.setNotifications(this.firstIndex);
  }

  async removeItem() {
    try {
      await this.libraryService.removeFromLibrary(this.libraryItemIdToDelete);
      this.libraryItems = (await this.libraryService.getLibrary({ page: 1, limit: 10 })).libraryItems;
      this.changeLibraryItemPage(this.currentPageNumber);
      this.showDeleteLibraryItemModal = false;
    } catch (e) {
      console.error(e);
    }
  }

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.currentIndex = index;
    this.downloading[index] = true;
    this.showDownloadModal = true;
    this.libraryService.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(object.id));
    this.downloading[index] = false;
  }

  // TODO: Come back and cry about this
  goToNotification(notification: any) {
    const parsedDetailsPath = notification.link.split('/');
    this.router.navigate(['/details/', parsedDetailsPath[2], parsedDetailsPath[3]]);
  }

  goToItem(object: LearningObject) {
    this.router.navigate(['/details/', object.author.username, object.cuid, object.version]);
  }

  async getRatings(learningObject: LearningObject): Promise<LearningObjectRatings> {
    const { cuid, version } = learningObject;
    return await this.ratingService.getLearningObjectRatings(
      cuid,
      version,
    );
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
      notification.attributes.cuid,
      notification.attributes.version
    );
    if (!this.openChangelogModal) {
      this.loadingChangelogs = true;
      try {
        this.changelogs = await this.changelogService.getAllChangelogs(
          notification.attributes.cuid,
          true, // minusRevision
        );
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

  async changeLibraryItemPage(pageNumber: number) {
    this.topOfList.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.currentPageNumber = pageNumber;
    await this.loadLibrary();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
