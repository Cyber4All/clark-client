import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { NotificationService } from './notification.service';
import { Component, Output, Input, ElementRef, EventEmitter, OnChanges, ChangeDetectorRef, AfterViewChecked } from '@angular/core';

@Component({
    selector: '<notification></notification>',
    template: `
    <div *ngFor="let el of toRender; let i = index;" [attr.data-notification]="i" [ngStyle]="{'bottom': el['bottom'] ? el['bottom'] + 'px' : '0px', 'left': el['left'] ? el['left'] : '20px', 'opacity': el['show'] ? 1 : 0}" [attr.class]="'notification ' + el.classes">
        <div class="icon"><div><i [attr.class]="el.icon"></i></div></div>
        <div class="note-content">
            <div class="title">{{el.title}}</div>
            <div class="text">{{el.text}}</div>
        </div>
    </div>
    `
})
export class NotificationComponent implements OnChanges, AfterViewChecked {
    toRender: Array<object> = [];
    @Input() content: object = {};

    private open: number = 0;
    private closed: number = 0;

    private notificationHeight = 90;
    private spaceBetween = 10;

    private changed = false;

    constructor(private elementRef: ElementRef, private service: NotificationService, private el: ElementRef) { }

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
                        (this.el.nativeElement.children[this.toRender.length - 1].offsetHeight + this.spaceBetween);
                }
            }

            setTimeout(() => {
                let notVisible = this.toRender.filter((x, index) => {
                    if (!x['show'] && !x['dead']) {
                        x['index'] = index;
                        return true;
                    }
                    return false;
                });
                for (let i = 0; i < notVisible.length; i++) {
                    
                    const e = notVisible[i];
                    // calculate bottom postion for each element
                    const below = notVisible.length > 1 ? notVisible.slice(i + 1)
                        .map(n => this.el.nativeElement.children[n['index']].offsetHeight + this.spaceBetween + 20)
                        .reduce((x, y) => x + y) : 20;
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

    close(el, duration = 4200) {
        
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