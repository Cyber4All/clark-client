import { Component, OnInit } from '@angular/core';
import { LearningObject, User } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { UserService } from 'app/core/user.service';
import { UsageStatsService } from 'app/cube/core/usage-stats/usage-stats.service';


@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss']
})
export class LearningObjectsComponent implements OnInit {
  featuredObject: LearningObject; // the learning object to display
  numReleasedObjects = 0; // default number of released objects before the service provides a new number
  page='homepage';

  constructor(private featureService: FeaturedObjectsService,
              private userService: UserService,
              private usageStatsService: UsageStatsService) { }

  async ngOnInit(): Promise<void> {
    await this.usageStatsService.getLearningObjectStats().then(stats => {
      this.numReleasedObjects = Math.floor(stats.released / 10) * 10;
    });
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
    if(this.featuredObject?.levels.length === 1) {
      return this.featuredObject.levels[0];
    }

    let levels = '';
    this.featuredObject.levels.forEach((level, index, array) => {
      if(index === array.length - 1) {
        levels += ' and ' + level;
      } else {
        levels += level + ', ';
      }
    });
    return levels;
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
