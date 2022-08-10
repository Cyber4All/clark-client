import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { LearningObjectService } from 'app/core/learning-object.service';


@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss']
})
export class LearningObjectsComponent implements OnInit {
  featuredObject: LearningObject;

  constructor(private featureService: FeaturedObjectsService,
              private learningObjectService: LearningObjectService) { }

  async ngOnInit(): Promise<void> {
    await this.featureService.getFeaturedObjects();
    await this.featureService.featuredObjects.subscribe(objects => {
      this.featuredObject = objects[2];
    });
    await this.learningObjectService.fetchLearningObjectWithResources({
      author: this.featuredObject.author._name,
      cuidInfo: {
        cuid: this.featuredObject.cuid
      },
      id: this.featuredObject.id
    }, ['outcomes']).subscribe(object => {
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

}
