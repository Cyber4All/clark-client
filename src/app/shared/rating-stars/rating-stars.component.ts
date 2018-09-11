import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'clark-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss']
})
export class RatingStarsComponent implements OnInit, OnChanges {
  /**
   * Number of total stars
   */
  @Input() count = 5;

  /**
   * Number of rated stars
   */
  @Input() rating: number;

  /**
   * Number of reviews this rating is averaged from
   */
  @Input() reviewsCount: number;

  /**
   * Color to render the stars. [dark | blue | gold | white (default)]
   */
  @Input() color: string;

  /**
   * Font size to render the stars and text (default is 16px);
   */
  @Input() size: number;

  iterableCount: Array<any>;

  styles: {fontSize?: string} = {};


  constructor() {

  }

  ngOnInit() {
    this.iterableCount = Array(this.count).fill(0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.count) {
      this.iterableCount = Array(changes.count.currentValue).fill(0);
    }

    if (changes.size) {
      this.styles.fontSize = changes.size.currentValue + 'px';
    }
  }

  get calculateBarWidth(): string {
    // subtracting 2px from full bar appears to achieve closest result
    return `calc(${(this.rating / this.count) * 100}% - 2px)`;
  }

}
