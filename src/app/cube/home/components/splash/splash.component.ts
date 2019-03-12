import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-homepage-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  @Input() placeholderText: string;
  @Output() input: EventEmitter<string> = new EventEmitter();
  @Output() search: EventEmitter<string> = new EventEmitter();

  searchText: string;

  constructor() { }

  ngOnInit() { }

  submitSearch(event: KeyboardEvent) {
    if (!event || event.keyCode === 13) {
      // no event was passed or event was passed and key pressed is enter key
      this.search.emit(this.searchText);
    }
  }
}
