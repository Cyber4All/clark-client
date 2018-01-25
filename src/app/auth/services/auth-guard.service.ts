import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Defines an AuthGuard which contains the logic for determining of a user can activate a route protected by the guard.
 * 
 * @author Sean Donnelly
 */
@Injectable()
export class AuthGuard implements CanActivate {
    private headers: HttpHeaders = new HttpHeaders();
 
    constructor(private router: Router, private http: HttpClient) {
        
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
        const u = localStorage.getItem('currentUser');
        if (!u) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }

        let parsedUser = JSON.parse(u);
        this.headers = new HttpHeaders(
            { 'Authorization': 'Bearer ' + parsedUser['token'] }
        );
        this.headers.append('Content-Type', 'text/plain');
        return this.http.post(environment.apiURL + '/validateToken', {token: parsedUser['token']}, {headers: this.headers, responseType: 'text'}).toPromise().then(val => {
            return true;
        }).catch(error => {
            console.error(error);
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        });
    }
}