import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartV2Service } from 'app/core/cartv2.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user.service';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { RatingService } from 'app/core/rating.service';

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

  constructor(
    public cartService: CartV2Service,
    private toaster: ToastrOvenService,
    private authService: AuthService,
    private router: Router,
    private user: UserService,
    private uri: UriRetrieverService,
    private ratings: RatingService,
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
        libraryItem['avgRating'] = (await this.getRatings(libraryItem)).avgValue;
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
  }

  goToItem(object: LearningObject) {
    this.router.navigate(['/details/', object.author.username, object.cuid]);
  }

  async getRatings(learningObject: LearningObject) {
    const { author, cuid, version, id } = learningObject;
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

  private async checkAccessGroup() {
    this.canDownload = this.authService.hasReviewerAccess();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
