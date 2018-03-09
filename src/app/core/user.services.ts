import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { USER_ROUTES } from '@env/route';



@Injectable()
export class UserService {
private headers : Headers = new Headers();  
    constructor(private http: Http) {  }

    editUserInfo(editInfo): Promise<any> {
        return this.http.patch(USER_ROUTES.EDIT_USER_INFO, editInfo, {
            headers: this.headers, 
            withCredentials: true,
        }).toPromise();
    }
}

