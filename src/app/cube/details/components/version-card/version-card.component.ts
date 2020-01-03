import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-version-card',
  templateUrl: './version-card.component.html',
  styleUrls: ['./version-card.component.scss']
})
export class VersionCardComponent {

  @Input() showButton: boolean;
  @Output() clickButtonEvent: EventEmitter<void> = new EventEmitter();

  emitClickButtonEvent(): void {
    this.clickButtonEvent.emit();
  }
}
