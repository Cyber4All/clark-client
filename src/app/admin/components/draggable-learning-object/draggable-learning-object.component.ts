import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../../core/collection.service';

@Component({
  selector: 'clark-draggable-learning-object',
  templateUrl: './draggable-learning-object.component.html',
  styleUrls: ['./draggable-learning-object.component.scss']
})
export class DraggableLearningObjectComponent implements OnInit {
  learningObject =  {
    'id': '5d3a15c2560016c3cd93263a',
    'cuid': '8487f27b-e2bd-437b-a69f-28722aa39ea9',
    'author': {
        'username': 'latifurk',
        'name': 'latifur khan',
        'email': 'lkhan@utdallas.edu',
        'organization': 'ut dallas'
    },
    'collection': 'nccp',
    'contributors': [],
    'date': '1585240963355',
    'description': '<p><strong>This module aims to give students a comprehensive background on Spark Streaming and Event Data analysis. The module is divided into two sub-modules. First sub-module introduces Big Data, Spark and its different components, Spark Streaming, Kafka, and text classification using Spark. Second sub-module introduces event data access, analysis, and prediction. </strong></p>',
    'revisionUri': null,
    'length': 'module',
    'levels': [
        'graduate'
    ],
    'name': 'Window-based Stream Data Analytics with SPARK and Kafka',
    'version': 0,
    'status': 'released'
};
  collection;
  constructor(
    private collectionService: CollectionService,
  ) { }

  async ngOnInit() {
    await this.fetchCollection(this.learningObject.collection);
  }

  async fetchCollection(abvName: string) {
    this.collection = await this.collectionService.getCollectionMetadata(abvName);
  }

    get date() {
      // tslint:disable-next-line:radix
      return new Date(parseInt(this.learningObject.date));
    }

}

