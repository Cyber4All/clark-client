import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  @Input() lastPageNumber: number;
  @Input() currentPageNumber: number;

  @Output() newPageNumberClicked = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  getPageNumberList() {

    const { leftSideCount, rightSideCount } = this.calculateSurroundingPageNumbers();

    const pageNumbers = [];

    // Set page numbers on the left side
    // of the selected page number
    for (let i = leftSideCount; i > 0; i--) {
       pageNumbers.push(this.currentPageNumber - i);
    }

    // Set selected page number
    pageNumbers.push(this.currentPageNumber);

    // Set page numbers on the right side
    // of the selected page number
    for (let i = 1; i <= rightSideCount; i++) {
      pageNumbers.push(this.currentPageNumber + i);
    }

    return pageNumbers;
  }

  getCappedRemainingPageCount() {
    const remainingPageCount = this.lastPageNumber - this.currentPageNumber;

    // Never dislay more than 2 page numbers on the right
    // of the selected page number
    const cappedRemainingPageCount = remainingPageCount > 2 ? 2 : remainingPageCount;
    return cappedRemainingPageCount;
  }

  getCappedPreviousPageCount() {
    // Always display two numbers to the left
    // of the selected number. If the selected
    // number is 1 or 2, display less.
    const cappedPreviousPageCount = this.currentPageNumber - 1 > 2 ? 2 : this.currentPageNumber - 1;
    return cappedPreviousPageCount;
  }

  calculateSurroundingPageNumbers() {
    let rightSideCount = this.getCappedRemainingPageCount();
    let leftSideCount = this.getCappedPreviousPageCount();

    // If there are less page numbers to show on the
    // right side, show more on the left side
    if (rightSideCount === 0 && this.currentPageNumber > 4) {
      leftSideCount = 4;
    } else if (rightSideCount === 1 && this.currentPageNumber >= 4) { leftSideCount = 3; }

    // If there are less page numbers to show on
    // the left side, show more on the right side
    if (leftSideCount === 0 && this.lastPageNumber >= 5) {
      rightSideCount = 4;
    } else if (leftSideCount === 1 && this.lastPageNumber >= 5) { rightSideCount = 3; }

    return { leftSideCount, rightSideCount };
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
