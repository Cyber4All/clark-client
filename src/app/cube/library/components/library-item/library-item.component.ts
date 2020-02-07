import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-library-item',
  templateUrl: './library-item.component.html',
  styleUrls: ['./library-item.component.scss']
})
export class LibraryItemComponent implements OnInit {

  @Input() learningObjectTitle: string;
  @Input() learningObjectLength: string;
  @Input() learningObjectAuthorName: string;
  @Input() learningObjectContributorCount: number;
  @Input() learningObjectAverageRating: number;

  @Output() downloadButtonClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteButtonClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onDownloadClick(e: Event) {
    this.downloadButtonClicked.emit(e);
  }


}
