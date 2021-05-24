import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';

@Component({
  selector: 'clark-library-item',
  templateUrl: './library-item.component.html',
  styleUrls: ['./library-item.component.scss']
})
export class LibraryItemComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @Input() learningObjectAverageRating: number;

  @Output() downloadButtonClicked = new EventEmitter<Event>();
  @Output() deleteButtonClicked = new EventEmitter<Event>();
  @Output() titleClicked = new EventEmitter<Event>();

  constructor() { }

  ngOnInit() {
  }

  onDownloadClick(e: Event) {
    this.downloadButtonClicked.emit(e);
  }

  onDeleteButtonClick(e: Event) {
    this.deleteButtonClicked.emit(e);
  }

  onTitleClick(e: Event) {
    this.titleClicked.emit(e);
  }

  getContributorsList() {
    let attribution = '';
    // Creates the attribution string: 'a' or 'a and # of other contributor(s)'
    if (this.learningObject.contributors && this.learningObject.contributors.length > 0) {
      attribution = this.capitalizeName(this.learningObject.contributors[0].name);
      if (this.learningObject.contributors.length > 1) {
        attribution += ' and ' + (this.learningObject.contributors.length - 1)
        + ' other contributor' + (this.learningObject.contributors.length > 2 ? 's' : '');
      }
    } else {
      attribution = 'No contributors';
    }
    return attribution;
  }

  private capitalizeName(name) {
    return name.replace(/\b(\w)/g, s => s.toUpperCase());
  }
}
