import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-new-rating',
  templateUrl: './new-rating.component.html',
  styleUrls: ['./new-rating.component.scss']
})
export class NewRatingComponent implements OnInit, OnChanges {
  @Input() count = 5;
  @Input() rating: number;
  @Input() comment: string;
  @Input() delete: boolean; // Setting delete to true changes the content of the menu
  @Output() setRating: EventEmitter<{number: number, comment: string}> = new EventEmitter();
  @Output() deleteRating: EventEmitter<void> = new EventEmitter();
  @Output() cancelRating: EventEmitter<void> = new EventEmitter();
  iterableCount: Array<any>;

  tips = [
    'Poor',
    'Needs Work',
    'Average',
    'Good',
    'Excellent'
  ];

  activeHover = -1;
  activePanel = 0;

  oldRating: number;

  constructor() { }

  ngOnInit() {
    this.iterableCount = Array(this.count).fill(0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.count) {
      this.iterableCount = Array(changes.count.currentValue).fill(0);
    }

    if (changes.rating) {
      if (changes.rating.isFirstChange) {
        this.oldRating = changes.rating.currentValue;
      } else {
        this.advance();
      }
    }
  }

  advance() {
    this.activePanel++;
  }

  setHover(i: number) {
    this.activeHover = i;
  }

  reset() {
    // reset the hover
    this.activeHover = -1;
  }

  rate(i: number) {
    this.rating = i;
    this.activePanel = 1;
    this.activeHover = -1;
  }

  submitRating() {
    this.setRating.emit({number: this.rating, comment: this.comment});
  }

  submitDeleteRating() {
    this.deleteRating.emit();
  }

  cancel() {
    // this.rating = this.oldRating;
    this.cancelRating.emit();
  }

  starShouldShow(i: number): boolean {
    return (this.activeHover !== -1 && i <= this.activeHover) || (this.activeHover === -1 && this.rating && i < this.rating);
  }
}
