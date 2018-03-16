import { USER_ROUTES } from '@env/route';
import { Http } from '@angular/http';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable()
export class RecaptchaValidator {

    constructor(private http: Http) {
    }

    validateToken(token: string) {
        return (_: AbstractControl) => {
            return this.http.get(USER_ROUTES.VALIDATE_CAPTCHA(), { params: { token } }).map(res => res.json()).map(res => {
                if (!res.success) {
                    return { tokenInvalid: true }
                }
                return null;
            });
        }
    }
}