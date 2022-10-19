import { Component, Input, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { UriRetrieverService } from 'app/core/uri-retriever.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Guideline, LearningObject } from '@entity';
import { Query } from 'app/interfaces/query';
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
    console.log(this.learningObject);
    console.log(this.learningObject);
    this.setFrameworkName(this.learningObject);
    console.log(this.frameworkNames);
    this.loading = false;
  }

  setFrameworkName(object) {
    const mappings = [];
    let uniqueNames = [];
    object.guidelines.forEach(mapping => {
      mappings.push(mapping);
    });
    uniqueNames = [...new Set(mappings.map(x => x.source))];
    this.frameworkNames = uniqueNames;
  }

  setDescription() {
    this.learningObject.description =
      this.learningObject.description.slice(0, 220) + (this.learningObject.description.length > 220 ? ' ...' : '');
  }
}
