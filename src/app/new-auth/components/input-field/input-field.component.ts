import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';
/**
 * input field for authentication module using
 * angular material input field and designed
 * to be used with ngModel
 *
 * @param isPwrd: Boolean - make true if the field is for a
 * password. default 'false'
 * @param phold: String - placeholder text, which becomes label
 * @param fControlType: 'email' | 'username' | 'password' | 'text' -
 * describes the type of validation needed for the field. default 'text'
 * no validation
 */
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
  @Input() isPwrd: Boolean = false;
  @Input() phold: String = '';
  @Input() fControlType: 'email' | 'username' | 'password' | 'text' = 'text';

  control: FormControl;
  hide: Boolean;

  //required for ControlValueAccessor
  public value: string;
  public changed: ( value: string ) => void;
  public touched: () => void;

  constructor(public authValidation: AuthValidationService) { }

  async ngOnInit(): Promise<void> {
    this.control = this.authValidation.getInputFormControl(this.fControlType);
    this.hide = this.isPwrd;
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
}
