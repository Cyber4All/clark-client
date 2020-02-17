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
    this.downloadButtonClicked.emit();
  }

  onDeleteButtonClick(e: Event) {
    this.deleteButtonClicked.emit(e);
  }

  onTitleClick(e: Event) {
    this.titleClicked.emit(e);
  }


}
