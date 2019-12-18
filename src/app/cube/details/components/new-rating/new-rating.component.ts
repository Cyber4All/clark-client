import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-new-rating',
  templateUrl: './new-rating.component.html',
  styleUrls: ['./new-rating.component.scss']
})
export class NewRatingComponent implements OnInit, OnChanges {
  @Input() count = 5;
  @Input() rating: {value: number, comment: string, id?: string};
  @Input() editing = false;
  @Output() setRating: EventEmitter<{value: number, comment: string, id?: string, editing?: boolean}> = new EventEmitter();
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
      if (!changes.rating.isFirstChange || changes.rating.currentValue) {
        this.advance();
      }
    }
  }

  regress() {
    this.activePanel = 0;
  }

  advance() {
    this.activePanel = 1;
  }

  setHover(i: number) {
    this.activeHover = i;
  }

  reset() {
    // reset the hover
    this.activeHover = -1;
  }

  rate(i: number) {
    this.rating.value = i;
    this.activePanel = 1;
    this.activeHover = -1;
  }

  submitRating() {
    this.setRating.emit({...this.rating, editing: this.editing});
  }

  cancel() {
    this.cancelRating.emit();
  }

  starShouldShow(i: number): boolean {
    return (this.activeHover !== -1 && i <= this.activeHover) || (this.activeHover === -1 && this.rating && i < this.rating.value);
  }
}
