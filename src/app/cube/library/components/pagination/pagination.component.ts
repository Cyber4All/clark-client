import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  @Input() currentPageNumber: number;


  @Output() newPageNumberClicked = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  onPageNumberClick(index: number) {
    this.newPageNumberClicked.emit(index);
  }

  onLeftArrowClick() {
    this.newPageNumberClicked.emit(this.currentPageNumber - 1);
  }

  onRightArrowClick() {
    this.newPageNumberClicked.emit(this.currentPageNumber + 1);
  }

}
