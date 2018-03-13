import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from 'app/core/auth.service';



@Injectable()
export class UserService {

    constructor(private http: Http, private auth: AuthService) {  }

    editUserInfo(user: any): Promise<any> {
        alert(this.auth.user.username);
        return this.http.patch(USER_ROUTES.EDIT_USER_INFO(this.auth.user.username), { user }, {
            withCredentials: true,
        }).toPromise();
    }
}

