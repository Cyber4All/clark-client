import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  async ngOnInit() {
    this.loading = true;
    this.setDescription();
    this.setFrameworkName(this.learningObject);
    this.loading = false;
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
