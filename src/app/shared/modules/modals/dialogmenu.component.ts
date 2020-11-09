import { ModalService } from './modal.service';
import {
  Component,
  ElementRef,
  DoCheck,
  AfterViewChecked,
} from '@angular/core';
import { ModalDirective } from './modal';

@Component({
  selector: '<clark-dialogmenu></clark-dialogmenu>',
  template: `
    <div *ngIf="show" class="popup-wrapper">
      <div
        class="popup dialog "
        id="popup-dialog"
        [ngClass]="'popup dialog ' + content.classes ? content.classes : ''"
        (clickOutside)="tryClose($event)"
      >
        <div
          *ngIf="content.canCancel"
          class="dialog-close"
          (activate)="optionClick($event, undefined)"
        >
          <i class="far fa-times"></i>
        </div>
        <div class="title-text">{{ content.title }}</div>
        <div class="text" [innerHtml]="content.text"></div>
        <div
          class=""
          id="dialog-button"
          [ngClass]="'btn-group ' + content.buttonGroupClasses"
        >
          <div
            *ngFor="let b of content.buttons"
            [attr.class]="'button ' + b.classes"
            [innerHTML]="b.text"
            (activate)="optionClick($event, b.func)"
          ></div>
        </div>
      </div>
    </div>
  `,
})
export class DialogMenuComponent
  extends ModalDirective
  implements DoCheck, AfterViewChecked {
  type = 'dialog';

  tryClose(event) {
    if (!this.justCreated) {
      if (event.target.classList.contains('popup-wrapper')) {
        this.close();
      }
    } else {
      this.justCreated = false;
    }
  }

  constructor(private elementRef: ElementRef, modalService: ModalService) {
    super(modalService);
  }
}
