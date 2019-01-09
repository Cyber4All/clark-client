import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MISC_ROUTES } from '@env/route';

@Injectable()
export class MessagesService {
    private _message: Array<{}>;
    
    get message() {
        return this._message;
    }

    constructor(private http: HttpClient) { }

    getStatus(): Promise<Array<{}>> {
        if (this._message) {
            return Promise.resolve(this._message);
        } else {
            return this.http.get(MISC_ROUTES.CHECK_STATUS, { withCredentials: true }).toPromise().then((val: any) => {
                this._message = val && val.length ? val : undefined;
                return this._message;
            });
        }
    }
}

