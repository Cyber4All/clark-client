import { AppModule } from '../../app.module';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { USER_ROUTES } from '../../../environments/route';
// import { EmailValidator } from './directives/validators';

/**
 * Handles user authentication logic for the application.
 * 
 * @author Sean Donnelly
 */
@Injectable()
export class AuthenticationService {

    private logger = new Subject<boolean>();
    private loggedIn: boolean;
    private headers: Headers = new Headers();

    /**
     * Creates an instance of AuthenticationService.
     * Grabs auth token
     * @param {Http} http 
     * @memberof AuthenticationService
     */
    constructor(private http: Http) {
        this.headers.append('Content-Type', 'application/json');
        let user = this.getUser();
        if (user) {
            this.validateToken(user.token);
        }
        else {
            this.logout();
        }
    }

    /**
     * Checks if the given user has an API token.
     * 
     * @param token The user's API token
     */
    validateToken(token: string) {
        if (!token) {
            console.error('Invalid token!');
            this.logout();
        } else {
            this.loggedIn = true;
            this.logger.next(this.loggedIn);
        }
    }

    /**
     * Posts the supplied username and password to the API for authentication.
     * If authentication is successful, the response contains the user object for storage
     * in local storage.
     * 
     * @param username The provided username
     * @param password The provided password
     */
    login(username: string, password: string) {
        const route = USER_ROUTES.LOGIN;
        return this.http.post(route, { username: username, password: password }, { headers: this.headers })
            .toPromise()
            .then(response => {
                let user = response.json();
                this.setUser(user);
                return user;
            }).catch(e => {
                throw new Error(e);
            });

    }

    /**
     * Posts the supplied user data to the API for account creation.
     * The returned user object is put into local storage.
     * 
     * @param username The provided username
     * @param password The provided password 
     * @param firstname The provided firstname 
     * @param lastname The provided lastname 
     * @param email The provided email 
     */
    register(username: string, password: string, firstname: string, lastname: string, email: string) {

        return this.http.post(USER_ROUTES.REGISTER, JSON.stringify({
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            email: email
        }),
            { headers: this.headers }).toPromise()
            .then(response => {
                let user = response.json();
                this.setUser(user);
                return user;
            })
    }

    /**
     * Logs a user out of the application.
     */
    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.loggedIn = false;
        this.logger.next(this.loggedIn);
    }

    /**
     * Returns an observable so that other classes can listen for any changes in the login state of the user.
     * 
     * @returns A boolean observable signifying whether the user is logged in or not. 
     */
    isLoggedIn(): Observable<boolean> {
        return this.logger.asObservable();
    }

    /**
     * If there is a user, parses it
     * if not, returns undefined
     * 
     * @returns {{token: string}} 
     * @memberof AuthenticationService
     */
    getUser() {
        let user = localStorage.getItem("currentUser");
        if (user) {
            return JSON.parse(user);
        }
        return undefined;
    }

    /**
     * Sets the supplied user data to the currentUser in local storage.
     * 
     * @param user A JSON object containing the user's data.
     */
    setUser(user) {

        if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.loggedIn = true;
            this.logger.next(this.loggedIn);
        }
    }

    /**
     * @returns the firstname of the user.
     */
    getName(): string {
        let user = this.getUser();
        if (user) {
            if (user.token) {
                return user['_name'];
            }
        }
    }

    /**
     * Allows for on demand checking of the login status.
     * 
     * @returns A boolean of whether the user is logged in or not.
     */
    checkStatus(): boolean {
        return this.loggedIn ? this.loggedIn : false;
    }

    //Private Helper Functions
    private logError(error: any) {
        try {
            error = error.json();
            console.error(error.error);
        } catch (e) {
            // ...ignore
            console.error(error);
        }

        return Observable.throw(error);
    }
    //END
}
