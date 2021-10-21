import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-collection-feature-cards',
  templateUrl: './feature-cards.component.html',
  styleUrls: ['./feature-cards.component.scss']
})
export class FeatureCardsComponent implements OnInit {

  @Input() learningObject: LearningObject;
  parents: [];
  children: [];
  constructor() { }

  ngOnInit(): void {
    // TO DO RETRIEVE PARENTS/CHILDREN
    // TO DO GET THE FULL COLLECTION
    console.log(this.learningObject);
  }

  getDescription() {
    return this.learningObject.description.slice(0, 260);
  }

}
