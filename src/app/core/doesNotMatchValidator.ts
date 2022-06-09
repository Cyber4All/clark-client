import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function doesNotMatchValidator(match: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) {
            return null;
        }

        return !(value === match) ? {doesNotMatch: true}: null;
    };
}
