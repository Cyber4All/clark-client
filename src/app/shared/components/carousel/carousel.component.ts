import {
  Component,
  ChangeDetectorRef,
  ContentChildren,
  QueryList,
  TemplateRef,
  Input,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { carousel } from './carousel.animation';

@Component({
  selector: 'clark-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  animations: [
    carousel
  ],
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  @ContentChildren(TemplateRef, { descendants: false }) items: QueryList<
    TemplateRef<any>
  >;

  @Input() action$: BehaviorSubject<number> | Subject<number> = new Subject();

  direction: 'next' | 'prev' | 'off' = 'off';
  index = 0;

  destroyed$: Subject<void> = new Subject();

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.action$.pipe(takeUntil(this.destroyed$)).subscribe(distance => {
      if (distance > 0) {
        this.advance(distance);
      } else if (distance < 0) {
        this.regress(Math.abs(distance));
      } else {
        console.error('Error! Invalid direction property specified! Distance must be a number greater than or less than 0.');
      }
    });
  }

  /**
   * Advance the carousel by an amount of {distance}
   *
   * @param {number} [distance=1]
   * @memberof CarouselComponent
   */
  advance(distance: number = 1) {
    this.direction = 'next';
    this.cd.detectChanges();

    if (this.index + distance >= this.items.length) {
      this.index = distance - (this.items.length - this.index);
    } else {
      this.index += distance;
    }
  }


  /**
   * Regress the carousel by an amount of {distance}
   *
   * @param {number} [distance=1]
   * @memberof CarouselComponent
   */
  regress(distance: number = 1) {
    this.direction = 'prev';
    this.cd.detectChanges();

    if (this.index - distance < 0) {
      this.index = this.items.length - distance;
    } else {
      this.index -= distance;
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
