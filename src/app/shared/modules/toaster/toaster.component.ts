import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { ToasterService } from './toaster.service';
import {
  Component,
  Input,
  ElementRef,
  OnChanges,
  AfterViewChecked
} from '@angular/core';

@Component({
  selector: '<clark-toaster></clark-toaster>',
  template: `
    <div
      *ngFor="let el of toRender; let i = index"
      [attr.data-notification]="i"
      [ngStyle]="{
        bottom: el['bottom'] ? el['bottom'] + 'px' : '0px',
        left: el['left'] ? el['left'] : '20px',
        opacity: el['show'] ? 1 : 0
      }"
      [attr.class]="'notification ' + el.classes"
    >
      <div class="icon">
        <div><i [attr.class]="el.icon"></i></div>
      </div>
      <div class="note-content" id="note-content">
        <div aria-live="Assertive" class="title">{{ el.title }}</div>
        <div aria-live="Assertive" class="text">{{ el.text }}</div>
      </div>
    </div>
  `,
  styleUrls: ['toaster.component.scss']
})
export class ToasterComponent implements OnChanges, AfterViewChecked {
  toRender: Array<object> = [];
  @Input() content: object = {};

  private open = 0;
  private closed = 0;

  private notificationHeight = 90;
  private spaceBetween = 10;

  private changed = false;

  constructor(
    private elementRef: ElementRef,
    private service: ToasterService,
    private el: ElementRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (Object.keys(this.content).length > 0) {
      this.toRender.push(this.content);
      this.open++;
      this.changed = true;
    }
  }

  ngAfterViewChecked() {
    if (this.changed) {
      this.changed = false;
      if (this.toRender.length > 1) {
        for (let i = 0; i < this.toRender.length - 1; i++) {
          this.toRender[i]['bottom'] +=
            this.el.nativeElement.children[this.toRender.length - 1]
              .offsetHeight + this.spaceBetween;
        }
      }

      setTimeout(() => {
        const notVisible = this.toRender.filter((x, index) => {
          if (!x['show'] && !x['dead']) {
            x['index'] = index;
            return true;
          }
          return false;
        });
        for (let i = 0; i < notVisible.length; i++) {
          const e = notVisible[i];
          // calculate bottom position for each element
          const below =
            notVisible.length > 1
              ? notVisible
                  .slice(i + 1)
                  .map(
                    n =>
                      this.el.nativeElement.children[n['index']].offsetHeight +
                      this.spaceBetween +
                      20
                  )
                  .reduce((x, y) => x + y)
              : 20;
          this.show(e, below, i * 200);
        }
      }, 200);
    }
  }

  show(el, below, timeout = 200, close = true) {
    setTimeout(() => {
      // set params
      el['show'] = true;
      el['bottom'] = below;

      // if close param true, start close timer
      if (close) {
        this.close(el);
      }
    }, timeout);
  }

  close(el, duration = 6200) {
    setTimeout(() => {
      el['show'] = false;
      el['left'] = '-80px';
      el['dead'] = true;
      this.closed++;

      setTimeout(() => {
        // clean up
        if (this.open - this.closed === 0) {
          this.closed = this.open = 0;
          this.toRender = [];
          this.service.content = {};
        }
      }, 200);
    }, duration);
  }
}
