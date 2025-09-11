import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { LearningObject, User } from '@entity';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { UserService } from 'app/core/user-module/user.service';
import { GoogleTagService } from '../../google-tag.service';
import { MetricService } from 'app/core/metric-module/metric.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(4px)' }),
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LearningObjectsComponent implements OnInit, OnDestroy {
  featuredObject: LearningObject; // the learning object to display
  featuredObjects: LearningObject[] = [];
  currentIndex = 0;
  private autoSlideSub: Subscription | null = null;
  private slideshowStateSub: Subscription | null = null;
  readonly slideIntervalMs = 5000;
  slideshowEnabled = false;

  numReleasedObjects = 0; // default number of released objects before the service provides a new number
  page = 'homepage';

  constructor(private featureService: FeaturedObjectsService,
    private userService: UserService,
    private metricService: MetricService,
    public googleTagService: GoogleTagService,
    private searchService: SearchService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.searchService.getLearningObjects({ 'status': ['released'] }).then(total => {
      this.numReleasedObjects = Math.floor(total.total / 10) * 10;
    });

    // Stats is being annoying so just no for now
    // await this.metricService.getLearningObjectStats().then(stats => {
    //   this.numReleasedObjects = Math.floor(stats.released / 10) * 10;
    // });
    await this.featureService.getFeaturedObjects();
    await this.featureService.featuredObjects.subscribe(objects => {
      this.featuredObjects = Array.isArray(objects) ? objects.slice(0, 5) : [];
      if (this.featuredObjects.length > 0) {
        if (this.slideshowEnabled) {
          this.currentIndex = Math.min(1, this.featuredObjects.length - 1);
          this.featuredObject = this.featuredObjects[this.currentIndex];
          this.startAutoSlide();
        } else {
          this.currentIndex = 0;
          this.featuredObject = this.featuredObjects[0];
          this.stopAutoSlide();
        }
      }
    });

      if (this.slideshowEnabled) {
        this.currentIndex = Math.min(1, this.featuredObjects.length - 1);
        this.featuredObject = this.featuredObjects[this.currentIndex];
        this.startAutoSlide();
      } else {
        this.currentIndex = 0;
        this.featuredObject = this.featuredObjects[0];
        this.stopAutoSlide();
      }
    
  }

  /**
   * Displays the featured object's levels, formatted
   *
   * @returns A comma separated string of learning object levels
   */
  displayFeaturedObjectLevels() {
    const levels = this.featuredObject?.levels;

    if (levels.length === 1){
      return levels[0];
    }
    if (levels.length === 2){
      return `${levels[0]} and ${levels[1]}`;
    }

    // For 3 or more items
    return levels.slice(0, -1).join(', ') + ', and ' + levels[levels.length - 1];
  }


  /**
   * Displays the user's Gravatar image using their email
   *
   * @param email The featured object's user's email
   * @returns The user's gravatar image
   */
  getGravatarImage(email: string) {
    return this.userService.getGravatarImage(email, 100);
  }

  /**
   * Given a view (desktop or mobile), returns the number of contributors to display on screen
   *
   * @returns The number of contributors to display in the featured contributors section
   */
  getNumAuthorsToDisplay(): number {
    const maxMobileWidth = 1125;
    return window.outerWidth <= maxMobileWidth ? 1 : 3;
  }

  next(): void {
    if (!this.featuredObjects || this.featuredObjects.length === 0) {
      return;
    }
    this.currentIndex = (this.currentIndex + 1) % this.featuredObjects.length;
    this.featuredObject = this.featuredObjects[this.currentIndex];
    this.startAutoSlide();
  }

  prev(): void {
    if (!this.featuredObjects || this.featuredObjects.length === 0) {
      return;
    }
    this.currentIndex = (this.currentIndex - 1 + this.featuredObjects.length) % this.featuredObjects.length;
    this.featuredObject = this.featuredObjects[this.currentIndex];
    this.startAutoSlide();
  }

  private startAutoSlide(): void {
    if (!this.slideshowEnabled) {
      this.stopAutoSlide();
      return;
    }
    if (this.autoSlideSub) {
      this.autoSlideSub.unsubscribe();
    }
    this.autoSlideSub = interval(this.slideIntervalMs).subscribe(() => this.next());
  }

  private stopAutoSlide(): void {
    if (this.autoSlideSub) {
      this.autoSlideSub.unsubscribe();
      this.autoSlideSub = null;
    }
  }

  goTo(index: number): void {
    if (!this.featuredObjects || this.featuredObjects.length === 0) {
      return;
    }
    this.currentIndex = ((index % this.featuredObjects.length) + this.featuredObjects.length) % this.featuredObjects.length;
    this.featuredObject = this.featuredObjects[this.currentIndex];
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.autoSlideSub) {
      this.autoSlideSub.unsubscribe();
      this.autoSlideSub = null;
    }
    if (this.slideshowStateSub) {
      this.slideshowStateSub.unsubscribe();
      this.slideshowStateSub = null;
    }
  }

}
