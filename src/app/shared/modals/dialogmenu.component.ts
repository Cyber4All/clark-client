import { ModalService } from './modal.service';
import { Component, Output, Input, ElementRef, EventEmitter, DoCheck, AfterViewChecked} from '@angular/core';
import { Modal } from './modal';

@Component({
    selector: '<app-dialogmenu></app-dialogmenu>',
    template: `
    <div *ngIf="show" class="popup-wrapper">
        <div class="popup dialog " [ngClass]="'popup dialog ' + (content.classes) ? content.classes : ''" (clickOutside)="optionClick('reject');">
            <div class="title-text">{{content.title}}</div>
            <div class="text">{{content.text}}</div>
            <div class="" [ngClass]="'btn-group ' + content.buttonGroupClasses">
                <div *ngFor="let b of content.buttons" [attr.class]="'button ' + b.classes" [innerHTML]="b.text" (click)="optionClick(b.func)"></div>
            </div>
        </div>
    </div>
    `
})
export class DialogMenuComponent extends Modal implements DoCheck, AfterViewChecked {
    type: string = 'dialog';

    constructor(private elementRef: ElementRef, modalService: ModalService) {
        super(modalService);
    }
}
