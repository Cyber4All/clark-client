import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MISC_ROUTES } from '@env/route';

@Injectable()
export class MessagesService {
    private _message: Message;

    get message() {
        return this._message;
    }

    constructor(private http: HttpClient) { }

    getStatus(): Promise<Message> {
        if (this._message) {
            return Promise.resolve(this._message);
        } else {
            return this.http.get(MISC_ROUTES.CHECK_STATUS, { withCredentials: true })
                .toPromise()
                .then((val: any) => {
                    if (val && val.length) {
                        this._message = new Message(val[0]['_id'], 'error', val[0]['maintenanceMessage']);
                        return this._message;
                    } else { throw new Error('System status returned a malformed message.'); }
                });
        }
    }
}

export class Message {
    id: string;
    type: string;
    message: string;

    constructor(id: string, type: string, message: string) {
        this.id = id;
        this.type = type;
        this.message = message;
    }
}
