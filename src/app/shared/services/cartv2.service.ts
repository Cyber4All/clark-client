import { USER_ROUTES } from "./../../../environments/route";
import { Injectable, OnInit } from "@angular/core";
import { LearningObject, User } from "@cyber4all/clark-entity";
import { Http, Headers } from "@angular/http";

@Injectable()
export class CartV2Service {
  private username = JSON.parse(localStorage.getItem('currentUser')) ? JSON.parse(localStorage.getItem('currentUser'))['_username'] : '';
  private headers: Headers = new Headers();


  constructor(private http: Http) {
    console.log(this.username);
    let token = JSON.parse(localStorage.getItem('currentUser')) ? JSON.parse(localStorage.getItem('currentUser')).token : '';
    this.headers.append('Authorization', 'Bearer ' + token);
    this.headers.append('Content-Type', 'application/json');
  }

  openLearningObject(url: string) {
    // location.href = url;
    window.open(url);
  }

  getCart(): Promise<Array<LearningObject>> {
    return this.http
      .get(USER_ROUTES.GET_CART(this.username), { headers: this.headers })
      .toPromise()
      .then(val => {
        console.log(val)
        return <Array<LearningObject>>val.json();
      });
  }

  addToCart(
    author: string,
    learningObjectName: string
  ): Promise<Array<LearningObject>> {
    // tslint:disable-next-line:max-line-length
    return this.http
      .post(
      USER_ROUTES.ADD_LEARNING_OBJECT_TO_CART(
        this.username,
        author,
        learningObjectName
      ), {}, { headers: this.headers }
      )
      .toPromise()
      .then(val => {
        return <Array<LearningObject>>val.json();
      });
  }

  removeFromCart(
    author: string,
    learningObjectName: string
  ): Promise<Array<LearningObject>> {
    // tslint:disable-next-line:max-line-length
    return this.http
      .delete(
      USER_ROUTES.CLEAR_LEARNING_OBJECT_FROM_CART(
        this.username,
        author,
        learningObjectName
      ), { headers: this.headers }
      )
      .toPromise()
      .then(val => {
        return <Array<LearningObject>>val.json();
      });
  }

  clearCart() {
    this.http
      .delete(USER_ROUTES.CLEAR_CART(this.username), { headers: this.headers })
      .toPromise()
      .then(val => {
        console.log(val);
      });
  }

  checkout() {
    this.http
      .get(USER_ROUTES.GET_CART(this.username) + '?download=true', { headers: this.headers })
      .toPromise()
      .then(val => {
        console.log(val);
      });
  }
}
