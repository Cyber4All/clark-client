import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'clark-dashboard-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Input() value: string;
  @Output() text: EventEmitter<string> = new EventEmitter();
}
