import { ModalListElement } from './modal-list-element';
import { Position } from './position';
import { Observable } from 'rxjs/Observable';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { nextTick } from 'q';

@Injectable()
export class ModalService {
  contextMenuContent: object = {};
  dialogMenuContent: object = {};
  action: EventEmitter<string> = new EventEmitter<string>();
  private sub: Subscription;

  constructor() { }

  /**
   * Creates a new dialog popup in center of screen and darkens background
   * 
   * @param name name of the popup
   * @param title title of popup
   * @param text Text for content of popup
   * @param classes (optional) classes to be applied to the popup
   * @param buttonGroupClasses (optional) classes to be applied to the btn-grpup element
   * @param buttons (optional) list of ModalListElements representing buttons to be added to the button group
   */
  @Output() makeDialogMenu(
    name: string,
    title: string,
    text: string,
    classes?: string,
    buttonGroupClasses?: string,
    buttons?: Array<ModalListElement>
  ): Observable<string> {

    let toSend = {name: name, title: title, text: text};

    if (classes) {
      toSend['classes'] = classes;
    }

    if (buttonGroupClasses) {
      toSend['buttonGroupClasses'] = buttonGroupClasses;
    }

    if (buttons) {
      toSend['buttons'] = buttons;
    }

    this.dialogMenuContent = toSend;
    return this.listen(name);
  }

  /**
   * Creates a new context menu with the specified list at the specified position. NOTE: either an element or a position MUST be specified!
   * 
   * @param name name of the popup
   * @param classes any classes to be applied to the popup element
   * @param list list of elements for the dropdown
   * @param el (optional) element for the menu to be postioned near
   * @param pos (optional) hardcoded position for element to appear
   */
  @Output() makeContextMenu(
    name: string,
    classes: string,
    list: Array<ModalListElement>,
    el?: Element,
    pos?: Position,
    checked?: Array<string>
  ): Observable<string> {
    if (typeof el === 'undefined' && typeof pos === 'undefined') {
      throw new Error('Must provide either an Element or a Position!');
    }

    let toSend = {name: name, classes: classes, list: list};

    if (el) {
      toSend['el'] = el;
    } else {
      toSend['pos'] = pos;
    }

    if (checked) {
      toSend['checked'] = checked;
    }

    this.contextMenuContent = toSend;
    return this.listen(name);
  }

  private listen(name: string): Observable<string>  {
    if (this.sub !== undefined) {
      // unsubscribe from old subscriptions to prevent multiple open and unused subscriptions
      this.sub.unsubscribe();
    }

    return new Observable<string>(observer => {
      this.sub = this.action.subscribe(val => {
        const v = JSON.parse(val);
        if (v.name === name) {
          // this is a message from the modal we're listening for
          if (v.message !== 'closed') {
            observer.next(v.message);
          } else {
            observer.complete();
          }
        }
      });
    });
  }

  close(type) {
    if (type === 'context') {
      this.closeContextMenu();
    } else if (type === 'dialog') {
      this.closeDialogMenu();
    }
  }

  closeAll() {
    this.contextMenuContent = {};
    this.dialogMenuContent = {};
  }

  closeContextMenu() {
    this.contextMenuContent = {};
  }

  closeDialogMenu() {
    this.dialogMenuContent = {};
  }

  offset(el) {
    const rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
  }
}
