import { Injectable, Input } from '@angular/core';

@Injectable()
export class ToasterService {
  @Input() content: object = {};
  map: object = {};

  constructor() { }

  notify(title: string, text: string, classes: string, icon: string): void {
    this.content = {title: title, text: text, classes: classes, icon: icon};
  }
}
