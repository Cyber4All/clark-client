import { Component, OnInit } from '@angular/core';
import { LearningObject, User } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { LearningObjectService } from 'app/core/learning-object.service';
import { UserService } from 'app/core/user.service';
import { UsageStatsService } from 'app/cube/core/usage-stats/usage-stats.service';


@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss']
})
export class LearningObjectsComponent implements OnInit {
  featuredObject: LearningObject;
  numReleasedObjects = 0; // default number of released objects before the service provides a new number

  constructor(private featureService: FeaturedObjectsService,
              private learningObjectService: LearningObjectService,
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
    await this.learningObjectService.fetchLearningObjectWithResources({
      author: this.featuredObject.author._name,
      cuidInfo: {
        cuid: this.featuredObject.cuid
      },
      id: this.featuredObject.id
    }, ['outcomes']).subscribe((object: LearningObject) => {
      this.featuredObject = object;
    });
  }

  displayFeaturedObjectLevels() {
    if(this.featuredObject?.levels.length === 1) {
      return this.featuredObject.levels[0];
    } else {
      let levels = '';
      this.featuredObject.levels.forEach((level, index, array) => {
        const levelCapitalized = this.capitalize(level);
        if(index === array.length - 1) {
          levels += ' and ' + levelCapitalized;
        } else {
          levels += levelCapitalized + ', ';
        }
      });
      return levels;
    }
  }

  capitalize(word: string | LearningObject.Level): string {
    let words: string[], result = '';
    if(word.includes(' ')) {
      words = word.split(' ');
    }

    if(words) {
      const newWords = words.map(substring => {
        return substring.charAt(0).toUpperCase() + substring.slice(1);
      });
      result = newWords.join(' ');
    } else {
      result += word.charAt(0).toUpperCase() + word.slice(1);
    }

    return result;
  }

  displayDescription() {
    let description = this.featuredObject.description;
    // The top regex is used for matching tags such as <br />
    // The bottom regex will catch tags such as </p>
    description = description.replace(/<[0-z\s\'\'=]*[\/]+>/gi, ' ');
    return description.replace(/<[\/]*[0-z\s\'\'=]+>/gi, ' ');
  }

  getGravatarImage(email: string) {
    return this.userService.getGravatarImage(email, 100);
  }

}
