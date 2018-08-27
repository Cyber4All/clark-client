import { Component, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

@Component({
    selector: 'clark-checkbox',
    template: `
<<<<<<< HEAD
    <div class="checkbox" id="checkbox" (click)="setStatus(!checked, true)" [ngClass]="{'active': checked}"></div>
=======
    <div class="checkbox" (click)="setStatus(!checked, true)" [ngClass]="{'active': checked, 'disabled': disabled}"></div>
>>>>>>> 313128c5b6dd16d68bbd824493fc4acb615a2043
    `
})
export class CheckBoxComponent implements OnChanges {
    checked = false;
    @Input() setValue: boolean;
    @Input() func: string;
    @Input() externalState = false;
    @Input() disabled = false;

    @Output() checkboxChecked: EventEmitter<string> = new EventEmitter();
    @Output() checkboxUnchecked: EventEmitter<string> = new EventEmitter();
    @Output() action: EventEmitter<string> = new EventEmitter();

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.setValue) {
            // this was set from the outside, so we don't need to fire an event
            this.setStatus(changes.setValue.currentValue, false);
        }
    }

    setStatus(value = true, shouldFire: boolean) {
        if (!this.externalState) {
            this.checked = value;
        }

        if (shouldFire) {
            this.sendEvent(this.func);
        }
    }

    sendEvent(message) {
        if (typeof message === 'undefined') {
            message = '';
        }

        if (this.checked) {
            this.checkboxChecked.emit(message);
        } else {
            this.checkboxUnchecked.emit(message);
        }

        this.action.emit((this.checked) ? message : '-' + message);
    }
}
