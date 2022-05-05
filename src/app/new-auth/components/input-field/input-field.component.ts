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
  @Input() fControlType: String = 'text';//can have values: userName, email, password, text
  @Output() dataEvent: EventEmitter<string> = new EventEmitter<string>();

  control: FormControl;
  hide: Boolean;
  errorMsg = '';

  //required for ControlValueAccessor
  public value: string;
  public changed: ( value: string ) => void;
  public touched: () => void;

  constructor(public authValidation: AuthValidationService) { }

  async ngOnInit(): Promise<void> {
    this.control = this.authValidation.getInputFormControl(this.fControlType);
    this.hide = this.pwrd;
    this.authValidation.getInputErrorMessage(this.control).subscribe(x => this.errorMsg = x);
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
    this.dataEvent.emit(val);
  }
}
