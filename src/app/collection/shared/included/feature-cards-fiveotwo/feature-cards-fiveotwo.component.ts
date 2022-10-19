import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { LearningObjectService } from 'app/core/learning-object.service';
import { LearningObject } from '@entity';
// import { AttributeService } from '../collection-feature/core/attribute.service';

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

  constructor(
    // private attributeService: AttributeService,
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.setDescription();

    this.learningObject.collection = await (await this.collectionService.getCollection(this.learningObject.collectionName)).name;
    this.loading = false;
    const params = {
      author: undefined,
      id: this.learningObject.id
    };
    this.setFrameworkName(params);
    console.log(this.frameworkNames);
  }

  setFrameworkName(params) {
    let objectOutcomes;
    let frameworkNames;
    this.learningObjectService.fetchLearningObject(params).subscribe((object) => {
      console.log(object);
      //Error Handling needed!!
      this.learningObjectService.fetchUri((object as LearningObject).resourceUris.outcomes).subscribe((outcome) => {
        objectOutcomes = outcome;
        console.log(outcome);
      });
    });
    for (let i=0; frameworkNames < 2; i++){

    }

    return objectOutcomes;
  }

  getUniqueNames(outcomes) {

  }

  setDescription() {
    this.learningObject.description =
      this.learningObject.description.slice(0, 220) + (this.learningObject.description.length > 220 ? ' ...' : '');
  }
}
