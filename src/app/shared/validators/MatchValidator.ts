import { UntypedFormGroup, ValidatorFn } from '@angular/forms';

export class MatchValidator {
    constructor() {}

    /**
     * Matches the values of two different control forms.
     * If the values do not match, the 2nd argument (i.e. matchingControlName) errors will be set to true
     *
     * @param controlName
     * @param matchingControlName
     * @returns
     */
    static mustMatch(controlName: string, matchingControlName: string): ValidatorFn{
        return (formGroup: UntypedFormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];

            if (matchingControl.errors && !matchingControl.errors.mustMatch) {
                return;
            }

            // set error on matchingControl if validation fails
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }

            return null;
        };
    }
}
