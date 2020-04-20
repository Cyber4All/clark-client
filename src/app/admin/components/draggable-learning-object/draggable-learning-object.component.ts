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

  goals() {
    const punc = ['.', '!', '?'];
    const descriptionString = this.learningObject.description;
    const final = this.truncateText(
      descriptionString.charAt(0).toUpperCase() +
        descriptionString.substring(1),
      150
    );

    if (punc.includes(final.charAt(final.length - 1))) {
      return final;
    } else {
      return final + '.';
    }
  }

    // truncates and appends an ellipsis to block of text based on maximum number of characters
    truncateText(text: string, max: number = 150, margin: number = 10): string {
      // remove any HTML characters from text
      text = this.stripHtml(text);

      // check to see if we need to truncate, IE is the text shorter than max + margin
      if (text.length <= max + margin) {
        return text.trim();
      }

    // ok now we know we need to truncate text
      let outcome = text.substring(0, max);
      const spaceAfter = text.substring(max).indexOf(' ') + outcome.length; // first space before the truncation index
      const spaceBefore = outcome.lastIndexOf(' '); // first space after the truncation index
      const punc = ['.', '!', '?'];

      // if we've truncated such that the last char is a space or a natural punctuation, just return
      if (punc.includes(outcome.charAt(outcome.length - 1))) {
        outcome = outcome.trim();
      } else if (outcome.charAt(outcome.length - 1) === ' ') {
        outcome = outcome.substring(0, outcome.length - 1).trim() + '...';
      }

      // otherwise we're in the middle of a word and should attempt to finsih the word before adding an ellpises
      if (spaceAfter - outcome.length <= margin) {
        outcome = text.substring(0, spaceAfter + 1).trim();
      } else {
        outcome = text.substring(0, spaceBefore + 1).trim();
      }

      return outcome.trim() + '...';
    }

    stripHtml(str: string): string {
      // The top regex is used for matching tags such as <br />
      // The bottom regex will catch tags such as </p>
      str = str.replace(/<[0-z\s\'\"=]*[\/]+>/gi, ' ');
      return str.replace(/<[\/]*[0-z\s\'\"=]+>/gi, ' ');
    }

    get date() {
      // tslint:disable-next-line:radix
      return new Date(parseInt(this.learningObject.date));
    }

}

