import { Component, OnInit } from '@angular/core';
import { LearningObject, User } from '@entity';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { UserService } from 'app/core/user-module/user.service';
import { GoogleTagService } from '../../google-tag.service';
import { MetricService } from 'app/core/metric-module/metric.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';


@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss']
})
export class LearningObjectsComponent implements OnInit {
  featuredObject: LearningObject; // the learning object to display
  numReleasedObjects = 0; // default number of released objects before the service provides a new number
  page = 'homepage';

  constructor(private featureService: FeaturedObjectsService,
    private userService: UserService,
    private metricService: MetricService,
    public googleTagService: GoogleTagService,
    private searchService: SearchService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.searchService.getLearningObjects({'status': ['released']}).then(total => {
      this.numReleasedObjects = Math.floor(total.total / 10) * 10;
    });

    // Stats is being annoying so just no for now
    // await this.metricService.getLearningObjectStats().then(stats => {
    //   this.numReleasedObjects = Math.floor(stats.released / 10) * 10;
    // });
    await this.featureService.getFeaturedObjects();
    await this.featureService.featuredObjects.subscribe(objects => {
      this.featuredObject = objects[1];
    });
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

}
