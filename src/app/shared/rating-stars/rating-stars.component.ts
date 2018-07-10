import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'clark-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent implements OnInit, OnChanges {
  @Input() count = 5;
  @Input() rating: number;
  @Input() reviewsCount: number;
  iterableCount: Array<any>;

  constructor() { }

  ngOnInit() {
    this.iterableCount = Array(this.count).fill(0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.count) {
      this.iterableCount = Array(changes.count.currentValue).fill(0);
    }
  }

}
