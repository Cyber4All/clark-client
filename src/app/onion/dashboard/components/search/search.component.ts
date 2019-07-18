import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'clark-dashboard-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Input() value: string;
  @Output() text: EventEmitter<string> = new EventEmitter();

  submitSearch(event?: KeyboardEvent) {
    if (!event || event.keyCode === 13) {
      // no event was passed or event was passed and key pressed is enter key
      this.text.emit(this.value);
    }
    if (this.value === null) {
      this.text.emit(this.value);
    }
  }
}
