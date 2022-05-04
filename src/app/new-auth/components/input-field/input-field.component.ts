import { Component, Input, OnInit, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';

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
  @Input() pwrd: Boolean = false;
  @Input() phold: String = '';
  //can have values:
  @Input() fControl: String = 'text';
  @Output() dataEvent: EventEmitter<string> = new EventEmitter<string>();

  control: FormControl;
  hide: Boolean = this.pwrd;

  //required for ControlValueAccessor
  public value: string;
  public changed: ( value: string ) => void;
  public touched: () => void;

  constructor(public authValidation: AuthValidationService) { }

  ngOnInit(): void {
    this.control = this.authValidation.getFormControl(this.fControl);
  }

  //implementation for ControlValueAccessor
  writeValue(value: string): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.changed = fn;
  }
  registerOnTouched(fn: any): void {
    this.touched = fn;
  }

  emitVal(val: string){
    console.log(val);
    this.dataEvent.emit(val);
  }
}
