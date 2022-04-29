import { Component, Input, OnInit, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'clark-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(
        () => InputFieldComponent
      ),
      multi: true
    }
  ]
})
export class InputFieldComponent implements OnInit, ControlValueAccessor {
  @Input() phold: String = '';
  @Input() pwrd: Boolean = false;
  @Input() error: Boolean = false;
  @Input() errMessage: String = '';
  @Output() dataEvent: EventEmitter<string> = new EventEmitter<string>();
  hide: Boolean;

  public value: string;

  public changed: ( value: string ) => void;

  public touched: () => void;

  public isDisabled: Boolean;

  constructor() { }

  ngOnInit(): void {
    this.hide = this.pwrd;
    }

  writeValue(value: string): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.changed = fn;
  }
  registerOnTouched(fn: any): void {
    this.touched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  emitVal(val: string){
    console.log(val);
    this.dataEvent.emit(val);
  }
}
