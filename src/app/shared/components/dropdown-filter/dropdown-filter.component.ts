import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

export interface DropdownFilterOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface DropdownFilterSelection {
  selectedValues: string[];
  selectedItems: DropdownFilterOption[];
}

@Component({
  selector: 'clark-dropdown-filter',
  templateUrl: './dropdown-filter.component.html',
  styleUrls: ['./dropdown-filter.component.scss'],
})
export class DropdownFilterComponent implements OnChanges {
  @Input() name = '';
  @Input() isMultiSelect = true;
  @Input() values: Array<string | DropdownFilterOption> = [];
  @Input() selectedValues: string[] = [];
  @Input() disabled = false;

  @Output() selectedValuesChange: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() selectionChange: EventEmitter<DropdownFilterSelection> =
    new EventEmitter<DropdownFilterSelection>();

  isOpen = false;
  options: DropdownFilterOption[] = [];
  internalSelectedValues: string[] = [];

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly cd: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.values) {
      this.options = this.normalizeOptions(this.values);
    }

    if (changes.selectedValues || changes.values || changes.isMultiSelect) {
      this.internalSelectedValues = this.normalizeSelectedValues(this.selectedValues);
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (!target || !this.elementRef.nativeElement.contains(target)) {
      this.isOpen = false;
      this.cd.detectChanges();
    }
  }

  get buttonLabel(): string {
    const selectedCount = this.internalSelectedValues.length;
    if (selectedCount === 0) {
      return this.name;
    }

    if (!this.isMultiSelect && selectedCount === 1) {
      const selectedValue = this.internalSelectedValues[0];
      const selectedItem = this.options.find((option) => option.value === selectedValue);
      return selectedItem ? `${this.name}: ${selectedItem.label}` : this.name;
    }

    return `${this.name} (${selectedCount})`;
  }

  toggleMenu(): void {
    if (this.disabled) {
      return;
    }

    this.isOpen = !this.isOpen;
    this.cd.detectChanges();
  }

  isSelected(value: string): boolean {
    return this.internalSelectedValues.includes(value);
  }

  onOptionClick(option: DropdownFilterOption, event: MouseEvent): void {
    event.stopPropagation();
    if (option.disabled) {
      return;
    }

    if (this.isMultiSelect) {
      if (this.isSelected(option.value)) {
        this.internalSelectedValues = this.internalSelectedValues.filter(
          (selectedValue) => selectedValue !== option.value,
        );
      } else {
        this.internalSelectedValues = [...this.internalSelectedValues, option.value];
      }
    } else {
      this.internalSelectedValues = this.isSelected(option.value) ? [] : [option.value];
      this.isOpen = false;
    }

    this.emitSelection();
    this.cd.detectChanges();
  }

  trackByValue(_index: number, option: DropdownFilterOption): string {
    return option.value;
  }

  private emitSelection(): void {
    const selectedValues = [...this.internalSelectedValues];
    this.selectedValuesChange.emit(selectedValues);
    this.selectionChange.emit({
      selectedValues,
      selectedItems: this.options.filter((option) => selectedValues.includes(option.value)),
    });
  }

  private normalizeOptions(values: Array<string | DropdownFilterOption>): DropdownFilterOption[] {
    return values.map((option) => {
      if (typeof option === 'string') {
        return {
          label: option,
          value: option,
        };
      }
      return option;
    });
  }

  private normalizeSelectedValues(selectedValues: string[]): string[] {
    const validValues: string[] = [];

    for (const selectedValue of selectedValues || []) {
      if (!this.options.some((option) => option.value === selectedValue)) {
        continue;
      }
      if (validValues.includes(selectedValue)) {
        continue;
      }
      validValues.push(selectedValue);
    }

    if (!this.isMultiSelect && validValues.length > 1) {
      return [validValues[0]];
    }

    return validValues;
  }
}
