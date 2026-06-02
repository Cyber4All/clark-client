import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'clark-clear-filters-button',
  templateUrl: './clear-filters-button.component.html',
  styleUrls: ['./clear-filters-button.component.scss'],
})
export class ClearFiltersButtonComponent {
  @Input() label = 'Clear Filters';
  @Output() clear: EventEmitter<void> = new EventEmitter<void>();

  onClear(): void {
    this.clear.emit();
  }
}
