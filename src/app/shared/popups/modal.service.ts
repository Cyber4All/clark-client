import { Observable } from 'rxjs/Observable';
import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class ModalService {
  contextMenuContent: object = {};
  dialogMenuContent: object = {};
  @Output() action: EventEmitter<string> = new EventEmitter();

  constructor() { }

  makeDialogMenu(o: object) {
    this.dialogMenuContent = o;
  }

  makeContextMenu(o: object) {
    this.contextMenuContent = o;
  }

  listen(name: string): Observable<any>  {
    const modalListener = new Observable(observer => {
      this.action.subscribe(val => {
        console.log('we\'re here');
        const v = JSON.parse(val);
        if (v.name === name) {
          observer.next(v.message);
          observer.complete();
        }
      });
    });

    return modalListener;
  }
  close(type) {
    if (type === 'context') {
      this.closeContextMenu();
    } else if (type === 'dialog') { this.closeDialogMenu(); }
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
