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
            if (this.toRender.length > 1) {
                for (let i = 0; i < this.toRender.length - 1; i++) {
                    this.toRender[i]['bottom'] +=
                        (this.el.nativeElement.children[this.toRender.length - 1].offsetHeight + this.spaceBetween);
                }
            }

            setTimeout(() => {
                this.toRender[this.toRender.length - 1]['show'] = true;
                this.toRender[this.toRender.length - 1]['bottom'] = 20;
            }, 200);

            this.close(this.toRender.length - 1);
            this.changed = false;
        }
    }

    close(index) {
        setTimeout(() => {
            this.toRender[index]['show'] = false;
            this.toRender[index]['left'] = '-80px';
            this.closed++;

            setTimeout(() => {
                // clean up
                if (this.open - this.closed === 0) {
                    this.closed = this.open = 0;
                    this.toRender = [];
                    this.service.content = {};
                    console.log('doin it', this.toRender);
                }
            }, 200);
        }, 4200);
    }
}