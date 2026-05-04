import { ToastrOvenService, ToastrOven } from '../notification.service';
import { Component, ElementRef, AfterViewChecked } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
    selector: '<clark-toastr-oven></clark-toastr-oven>',
    template: `
    @for (el of toRender; track el; let i = $index) {
      <div
        [attr.data-notification]="i"
        [ngStyle]="el.style"
        [attr.class]="'toastr-oven-notification ' + el.classes"
        >
        <div class="icon">
          @if (el.classes.includes('success')) {
            <div>
              <i class="far fa-check"></i>
            </div>
          }
          @if (el.classes.includes('error')) {
            <div>
              <i class="far fa-times"></i>
            </div>
          }
          @if (el.classes.includes('warning')) {
            <div>
              <i class="fas fa-exclamation-triangle"></i>
            </div>
          }
          @if (el.classes === '') {
            <div><i class="fas fa-exclamation"></i></div>
          }
          @if (el.classes.includes('alert')) {
            <div>
              <i class="fas fa-exclamation"></i>
            </div>
          }
        </div>
        <div class="note-content">
          @if (el.title) {
            <div class="title">{{ el.title }}</div>
          }
          <div class="text">{{ el.text }}</div>
        </div>
      </div>
    }
    `,
    styleUrls: ['notification.component.scss'],
    standalone: true,
    imports: [
    NgStyle
],
})
export class ToastrOvenComponent implements AfterViewChecked {
  toRender: Array<ToastrOvenElement> = [];
  private open = 0;
  private closed = 0;
  private changed = 0;

  private cleanupTimer;
  private spaceBetween = 25;

  constructor(private service: ToastrOvenService, private el: ElementRef) {
    this.service.emitter.subscribe((t: ToastrOvenElement) => {
      t.index = this.toRender.length;
      t.show = false;
      t.dead = false;
      t.style = { opacity: '0' };
      t.style[this.service.position.y] = '0px';
      t.style[this.service.position.x] = '20px';
      this.toRender.push(t);
      this.open++;
      this.changed++;
    });
  }

  async ngAfterViewChecked() {
    if (this.changed) {
      const count = this.changed;
      this.changed = 0;

      if (this.toRender.length > 1) {
        for (let i = 0; i < this.toRender.length - 1; i++) {
          let below = 0;
          if (count > 1) {
            below =
              this.toRender
                .slice(i + 1)
                .map(
                  (n) =>
                    this.el.nativeElement.children[n['index']].offsetHeight +
                    this.spaceBetween
                )
                .reduce((x, y) => x + y) + this.spaceBetween;
          } else {
            below +=
              this.el.nativeElement.children[this.toRender.length - 1]
                .offsetHeight + this.spaceBetween;
          }
          this.toRender[i].style[this.service.position.y] =
            parseInt(this.toRender[i].style[this.service.position.y], 10) +
            below +
            'px';
        }
      }

      const notVisible = this.toRender.filter((x, index) => {
        if (!x.show && !x.dead) {
          return true;
        }
        return false;
      });

      setTimeout(async () => {
        for (let i = 0; i < notVisible.length; i++) {
          const el = this.toRender[notVisible[i].index];
          await this.show(
            el,
            el.style[this.service.position.y]
              ? parseInt(el.style[this.service.position.y], 10) + 20
              : 20
          );
        }
      }, 50);
    }
  }

  private show(
    el: ToastrOvenElement,
    below: number,
    timeout = 200,
    close = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // set params
      el.show = true;
      el.style[this.service.position.y] = below + 'px';
      el.style.opacity = '1';

      // if close param true, start close timer
      if (close) {
        this.close(el);
      }

      return setTimeout(() => {
        return resolve();
      }, 200); // show animation time defined in css
    });
  }

  private close(el: ToastrOvenElement, duration = 4200) {
    setTimeout(() => {
      el.show = false;
      el.style[this.service.position.x] = '-80px';
      el.style.opacity = '0';
      el.dead = true;
      this.closed++;

      clearTimeout(this.cleanupTimer);

      this.cleanupTimer = setTimeout(() => {
        // clean up
        if (this.open - this.closed === 0) {
          this.closed = this.open = 0;
          this.toRender = [];
        }
      }, 200); // hide animation time defined in css
    }, duration);
  }
}

interface ToastrOvenElement extends ToastrOven {
  show: boolean;
  dead: boolean;
  index: number;
  style: {
    opacity: '0' | '1';
    [key: string]: string;
  };
}
