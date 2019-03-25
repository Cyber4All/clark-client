import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-privileges-list',
  templateUrl: './privileges-list.component.html',
  styleUrls: ['./privileges-list.component.scss']
})
export class PrivilegesListComponent implements OnInit {

  @Input() privileges: string[][];
  @Input() collections: string[];

  @Output() delete: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }


  remove(index: number) {
    this.delete.emit(index);
  }

}
