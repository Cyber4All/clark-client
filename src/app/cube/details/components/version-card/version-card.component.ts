import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-version-card',
  templateUrl: './version-card.component.html',
  styleUrls: ['./version-card.component.scss']
})
export class VersionCardComponent implements OnInit {

  @Input() showButton: boolean;
  @Input() version: number;
  @Output() clickButtonEvent: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  emitClickButtonEvent(): void {
    this.clickButtonEvent.emit();
  }

}
