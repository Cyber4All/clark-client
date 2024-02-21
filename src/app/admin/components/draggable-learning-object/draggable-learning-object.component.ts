import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CollectionService } from '../../../core/collection-module/collections.service';
import { LearningObject, Collection } from '@entity';
import { titleCase } from 'title-case';


@Component({
  selector: 'clark-draggable-learning-object',
  templateUrl: './draggable-learning-object.component.html',
  styleUrls: ['./draggable-learning-object.component.scss']
})
export class DraggableLearningObjectComponent implements OnInit {
  @Input() learningObject: LearningObject;
  @Input() loading: boolean;
  @Input() preview: boolean;
  @Output() delete: EventEmitter<LearningObject> = new EventEmitter();

  collections = new Map<string, string>();
  collection;

  constructor(
    private collectionService: CollectionService,
  ) {}

  ngOnInit() {
    this.collectionService.getCollection(this.learningObject.collection).then(collection => {
      this.collection = collection.name;
    });
  }

  removeFromList() {
    this.delete.emit(this.learningObject);
  }
  goals() {
    const punc = ['.', '!', '?'];
    const descriptionString = this.learningObject.description;
    const final = this.truncateText(
      descriptionString.charAt(0).toUpperCase() +
        descriptionString.substring(1),
      120
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
    let guideline = text.substring(0, max);
    const spaceAfter = text.substring(max).indexOf(' ') + guideline.length; // first space before the truncation index
    const spaceBefore = guideline.lastIndexOf(' '); // first space after the truncation index
    const punc = ['.', '!', '?'];

    // if we've truncated such that the last char is a space or a natural punctuation, just return
    if (punc.includes(guideline.charAt(guideline.length - 1))) {
      guideline = guideline.trim();
    } else if (guideline.charAt(guideline.length - 1) === ' ') {
      guideline = guideline.substring(0, guideline.length - 1).trim() + '...';
    }

    // otherwise we're in the middle of a word and should attempt to finsih the word before adding an ellpises
    if (spaceAfter - guideline.length <= margin) {
      guideline = text.substring(0, spaceAfter + 1).trim();
    } else {
      guideline = text.substring(0, spaceBefore + 1).trim();
    }

    return guideline.trim() + '...';
  }

  stripHtml(str: string): string {
    // The top regex is used for matching tags such as <br />
    // The bottom regex will catch tags such as </p>
    str = str.replace(/<[0-z\s\'\"=]*[\/]+>/gi, ' ');
    return str.replace(/<[\/]*[0-z\s\'\"=]+>/gi, ' ');
  }

  get date() {
    // eslint-disable-next-line radix
    return new Date(parseInt(this.learningObject.date));
  }

  /**
   * Function to conditionally set the title case of an organization
   *
   * @param organization string of the users affiliated organization
   * @returns string unformated or title cased
   */
     organizationFormat(organization: string) {
      if ( organization.charAt(1) === organization.charAt(1).toUpperCase() ) {
        return organization;
      } else {
        return titleCase(organization);
      }
    }

}

