import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { USER_ROUTES } from 'app/core/user-module/user.routes';

@Injectable({
    providedIn: 'root'
})
export class RecaptchaValidator {

    constructor(private http: HttpClient) {
    }

    validateToken(token: string) {
        return (_: AbstractControl) => {
            return this.http.get(USER_ROUTES.VALIDATE_CAPTCHA(), { params: { token } }).pipe(
                map((res: any) => {
                    if (!res.success) {
                        return { tokenInvalid: true };
                    }
                    return null;
                }));
        };
    }
}
