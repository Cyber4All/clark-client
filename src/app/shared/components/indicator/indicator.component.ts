import {
  Component, Input, EventEmitter, Output, OnChanges, SimpleChanges, ViewChildren, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';

const highlightWidth = 6;

@Component({
  selector: 'clark-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.scss']
})
export class IndicatorComponent implements OnChanges, AfterViewInit {

  @ViewChildren('element') elementRefs;
  @ViewChild('highlight') highlight: ElementRef;
  @ViewChild('indicator') indicator: ElementRef;

  @Input() elements: string[];
  @Input() active = 0;
  @Input() increment: number;
  @Input() decrement: number;

  @Output() change = new EventEmitter<number>();
  @Output() shouldChange = new EventEmitter<number>();

  // state
  initialized = false;
  animatingTimeout: NodeJS.Timer;

  constructor() { }

  ngAfterViewInit() {
    this.move();
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {
      if (changes.active) {
        this.move((changes.active.currentValue < changes.active.previousValue) ? -1 : 1);
        this.changed();
      }
    }
  }

  signalChange(index: number) {
    this.shouldChange.emit(index);
  }

  changed() {
    this.change.emit(this.active);
  }

  move(direction?: number) {
    const targetEl = this.elementRefs.toArray()[this.active].nativeElement;
    const parentEl = this.indicator.nativeElement;

    if (!direction) {
      this.highlight.nativeElement.style.left = targetEl.offsetLeft + 3 + 'px';
      this.highlight.nativeElement.style.right =
        (parentEl.offsetWidth - (targetEl.offsetLeft + targetEl.offsetWidth / 2) - highlightWidth) + 3 + 'px';
    } else {
      clearTimeout(this.animatingTimeout);
      if (direction < 0) {
        // animate left, then right
        this.highlight.nativeElement.style.left = targetEl.offsetLeft + 3 + 'px';

        this.animatingTimeout = setTimeout(() => {
          this.highlight.nativeElement.style.right =
            (parentEl.offsetWidth - (targetEl.offsetLeft + targetEl.offsetWidth / 2) - highlightWidth) + 3 + 'px';
        }, 220);
      } else {
        // animate right, then left
        this.highlight.nativeElement.style.right =
          (parentEl.offsetWidth - (targetEl.offsetLeft + targetEl.offsetWidth / 2) - highlightWidth) + 3 + 'px';

          this.animatingTimeout = setTimeout(() => {
          this.highlight.nativeElement.style.left = targetEl.offsetLeft + 3 + 'px';
        }, 190);
      }
    }

  }

}
