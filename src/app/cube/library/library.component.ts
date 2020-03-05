import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { LibraryService } from 'app/core/library.service';
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
import { trigger, style, state, transition, animate } from '@angular/animations';

@Component({
  selector: 'clark-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  // animations: [
  //   // the fade-in/fade-out animation.
  //   trigger('simpleFadeAnimation', [

  //     // the "in" style determines the "resting" state of the element when it is visible.
  //     state('in', style({opacity: 1})),

  //     // fade in when created. this could also be written as transition('void => *')
  //     transition(':enter', [
  //       style({opacity: 1, transform: 'translateX(90px)'}),
  //       animate(200)
  //     ]),

  //     // // fade out when destroyed. this could also be written as transition('void => *')
  //     // transition(':leave',
  //     //   animate(200, style({opacity: 0, transform: 'translateX(-90px)'})))
  //   ])
  // ]
})
export class LibraryComponent implements OnInit, OnDestroy {

  loading: boolean;
  serviceError: boolean;
  libraryItems: LearningObject[] = [];
  downloading = [];
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
  libraryItemToDelete;
  lastPageNumber;
  currentPageNumber = 1;
  currentNotificationsPageNumber = 1;
  lastNotificationsPageNumber = 1;
  // Notification Card variables
  notificationCardCount = 0;
  indexOfLastNotification = 0;
  indexOfFirstNotification = 0;
  lastNotificationIndex;


  constructor(
    public libraryService: LibraryService,
    private toaster: ToastrOvenService,
    private authService: AuthService,
    private router: Router,
    private user: UserService,
    private ratings: RatingService,
    private changelogService: ChangelogService,
    private cd: ChangeDetectorRef,
    private learningObjectService: LearningObjectService,
  ) {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  async getScreenSize() {
    const width = window.innerWidth;
    const previousCardCount = this.notificationCardCount;
    // Mobile devices
    if (width <= 750) {
      this.notificationCardCount = 1;
      // Normal tablets
    } else if (width > 750 && width <= 1350) {
      this.notificationCardCount = 2;
      // Smaller Desktops
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
      // this.indexOfFirstNotification = (this.indexOfFirstNotification + this.indexOfLastNotification) - this.notificationCardCount;
      // this.indexOfLastNotification = this.notificationCardCount;
      this.setNotifications(this.indexOfFirstNotification);
    }
  }

  ngOnInit() {
    this.loadLibrary();
  }

  async loadLibrary() {
    try {
      this.loading = true;
      const libraryItemInformation = await this.libraryService.getLibrary(this.currentPageNumber, 10);
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
      console.log(e);
      this.toaster.error('Error!', 'Unable to load your library. Please try again later.');
      this.serviceError = true;
      this.loading = false;
    }
  }

  async getNotifications(apiPage: number) {
    // Clicked to new page
    if (apiPage <= this.lastNotificationsPageNumber && apiPage > 0) {
      const result = await this.user.getNotifications(this.authService.user.username, apiPage, 20);
      this.localNotifications = result.notifications;
      this.lastNotificationsPageNumber = result.lastPage;
      this.currentNotificationsPageNumber = apiPage;
    }
  }

  /**
   * This will set the notifications array according to the number of cards that are to be displayed and
   * the page number the user is currently on.
   * @param page The current page that the user is on
   */
  setNotifications(index: number) {
    // If the index is equal to the index of the first notification
    if (index === this.indexOfFirstNotification) {
      this.indexOfFirstNotification = this.indexOfFirstNotification;
      this.indexOfLastNotification = this.notificationCardCount;
      // If the index requested is less than the index of the first notification
    } else if (index < this.indexOfFirstNotification && index >= 0) {
      this.indexOfFirstNotification = this.indexOfFirstNotification - this.notificationCardCount;
      this.indexOfLastNotification = this.indexOfLastNotification - this.notificationCardCount;
      // If the index requested is greater than the index of the first notification
    } else if (index > this.indexOfFirstNotification && this.indexOfLastNotification + this.notificationCardCount <= this.localNotifications.length) {
      this.indexOfFirstNotification = this.indexOfFirstNotification + this.notificationCardCount;
      this.indexOfLastNotification = this.indexOfLastNotification + this.notificationCardCount;
    }
    console.log(index);
    this.notifications = this.localNotifications.slice(this.indexOfFirstNotification, this.indexOfLastNotification);
  }

  async deleteNotification(notification: any) {
    await this.user.deleteNotification(this.authService.user.username, notification.id);
    await this.getNotifications(this.currentPageNumber);
  }

  async removeItem() {
    try {
      await this.libraryService.removeFromLibrary(this.libraryItemToDelete.cuid);
      this.libraryItems = (await this.libraryService.getLibrary(1, 10)).cartItems;
      this.changeLibraryItemPage(this.currentPageNumber);
      this.showDeleteLibraryItemModal = false;
    } catch (e) {
      console.log(e);
    }
  }

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.downloading[index] = true;
    this.libraryService.downloadLearningObject(
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

  async changeLibraryItemPage(pageNumber: number) {
    const libraryItemInformation = await this.libraryService.getLibrary(pageNumber, 10);
    this.libraryItems = libraryItemInformation.cartItems;
    this.lastPageNumber = libraryItemInformation.lastPage;
    this.currentPageNumber = pageNumber;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
