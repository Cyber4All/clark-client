import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { Lightsail } from 'aws-sdk';

@Component({
  selector: 'clark-feature-cards-fiveotwo',
  templateUrl: './feature-cards-fiveotwo.component.html',
  styleUrls: ['./feature-cards-fiveotwo.component.scss']
})
export class FeatureCardsFiveotwoComponent implements OnInit {

  @Input() learningObject: any;

  outcomes;
  loading = true;
  updatedLearningObject;
  frameworkNames;
  mapped = false;
  theme = 'light';

  constructor(
    private collectionService: CollectionService
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.setDescription();
    this.setFrameworkName(this.learningObject);
    this.loading = false;
    this.collectionService.darkMode502.subscribe(mode => {
      if(mode){
        this.theme = 'dark';
      } else{
        this.theme = 'light';
      }
    });
  }
/**
 * Creates an array of all the unique mappings of an object
 *
 * @param object
 */
  setFrameworkName(object) {
    const mappings = [];
    let uniqueNames = [];
    object.guidelines.forEach(mapping => {
      mappings.push(mapping);
    });
    uniqueNames = [...new Set(mappings.map(x => x.source))];
    if (uniqueNames.length > 0){
        this.mapped = true;
    }
    this.frameworkNames = uniqueNames;
  }
/**
 * truncates description and adds elipse
 */
  setDescription() {
    this.learningObject.description =
      this.learningObject.description.slice(0, 220) + (this.learningObject.description.length > 220 ? ' ...' : '');
  }
}
