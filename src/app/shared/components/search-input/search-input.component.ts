import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'clark-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent implements OnChanges, OnDestroy {
  @Input() placeholder = 'Search';
  @Input() ariaLabel = '';
  @Input() width = '260px';
  @Input() fullWidth = false;
  @Input() value = '';
  @Input() debounceMs = 0;

  @Output() userInput: EventEmitter<string> = new EventEmitter<string>();

  currentValue = '';
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.placeholder && !this.ariaLabel) {
      this.ariaLabel = this.placeholder;
    }

    if (changes.value) {
      this.currentValue = this.value || '';
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.currentValue = target.value;

    if (this.debounceMs > 0) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.userInput.emit(this.currentValue);
      }, this.debounceMs);
      return;
    }

    this.userInput.emit(this.currentValue);
  }
}
