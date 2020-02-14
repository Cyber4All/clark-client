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

  @Output() downloadButtonClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteButtonClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onDownloadClick(e: Event) {
    this.downloadButtonClicked.emit();
  }


}
