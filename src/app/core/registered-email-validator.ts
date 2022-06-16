import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({ providedIn:'root' })
export class RegisteredEmailValidator implements AsyncValidator {
    constructor(private userService: UserService) {}

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>{
        const query = {
            text: control.value
        };

        return this.userService.searchUsers(query).then(
            userArray => {
                return userArray ? {unRegisteredEmail: true} : null;
            });
    }
}
