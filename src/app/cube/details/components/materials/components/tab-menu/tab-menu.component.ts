import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'clark-tab-menu',
  templateUrl: './tab-menu.component.html',
  styleUrls: ['./tab-menu.component.scss']
})
export class TabMenuComponent {

  @Input() currentSelection: string;
  @Output() select: EventEmitter<string> = new EventEmitter();;

  options = [
    {
      name: 'Files',
      class: 'far fa-folders',
    },
    {
      name: 'URLs',
      class: 'far fa-link',
    },
    {
      name: 'Notes',
      class: 'far fa-sticky-note'
    },
  ];

  emitSelection(selection: string) {
    this.select.emit(selection);
  }

}
