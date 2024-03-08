import { map } from 'rxjs/operators';
import { LEGACY_USER_ROUTES } from '../../../../core/learning-object-module/learning-object/learning-object.routes';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class RecaptchaValidator {

    constructor(private http: HttpClient) {
    }

    validateToken(token: string) {
        return (_: AbstractControl) => {
            return this.http.get(LEGACY_USER_ROUTES.VALIDATE_CAPTCHA(), { params: { token } }).pipe(
                map((res: any) => {
                    if (!res.success) {
                        return { tokenInvalid: true };
                    }
                    return null;
                }));
        };
    }
}
