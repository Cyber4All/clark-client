import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ContentChildren,
  QueryList,
  TemplateRef,
  Input,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { carousel } from './carousel.animation';

@Component({
  selector: 'clark-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  animations: [ carousel ]
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @ContentChildren(TemplateRef, { descendants: false }) items: QueryList<
    TemplateRef<any>
  >;

  @Input() action$: Subject<string> = new Subject();

  direction: 'next' | 'prev' = 'next';
  index = 0;

  destroyed$: Subject<void> = new Subject();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.action$.pipe(takeUntil(this.destroyed$)).subscribe(action => {
      // this should be a value of either '+' or '-'
      const direction: string = action.charAt(0);
      // if the action string is only the direction character, default the distance to 1
      const distance: number =
        action.length === 1 ? 1 : parseInt(action.substring(1), 10);

      if (direction === '+') {
        this.advance(distance);
      } else if (direction === '-') {
        this.regress(distance);
      } else {
        console.error('Error! Invalid direction property specified!');
      }
    });
  }

  advance(distance: number = 1) {
    this.direction = 'next';
    this.cd.detectChanges();

    if (this.index + distance >= this.items.length) {
      this.index = distance - (this.items.length - this.index);
    } else {
      this.index += distance;
    }

  }

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
