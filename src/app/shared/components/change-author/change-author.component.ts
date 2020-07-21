import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-change-author',
  templateUrl: './change-author.component.html',
  styleUrls: ['./change-author.component.scss']
})
export class ChangeAuthorComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
