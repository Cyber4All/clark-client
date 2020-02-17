import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.scss']
})
export class NotificationCardComponent implements OnInit {

  @Input() notification: { text: string, timestamp: string, link: string, attributes: any };

  @Output() deleteButtonClicked = new EventEmitter<Event>();
  @Output() changeLogButtonClicked = new EventEmitter<Event>();
  constructor() { }

  ngOnInit() {
  }

  onDeleteButtonClick(e: Event) {
    this.deleteButtonClicked.emit(e);
  }

  onChangelogButtonClick(e: Event) {
    this.changeLogButtonClicked.emit(e);
  }
}
