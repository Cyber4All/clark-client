import { USER_ROUTES } from "./../../../environments/route";
import { Injectable, OnInit } from "@angular/core";
import { LearningObject, User } from "@cyber4all/clark-entity";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CartV2Service {
  private username = JSON.parse(localStorage.getItem('currentUser'))._username;

  constructor(private http: HttpClient) {
    console.log(this.username);
  }

  openLearningObject(url: string) {
    // location.href = url;
    window.open(url);
  }

   getCart(): Promise<Array<LearningObject>> {
    return this.http
      .get(USER_ROUTES.GET_CART(this.username))
      .toPromise()
      .then(val => {
        return <Array<LearningObject>> val;
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
        ),
        {}
      )
      .toPromise()
      .then(val => {
        return <Array<LearningObject>> val;
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
        )
      )
      .toPromise()
      .then(val => {
        return <Array<LearningObject>> val;
      });
  }

  clearCart() {
    this.http
      .delete(USER_ROUTES.CLEAR_CART(this.username))
      .toPromise()
      .then(val => {
        console.log(val);
      });
  }

  checkout() {
    this.http
      .get(USER_ROUTES.GET_CART(this.username) + '?download=true')
      .toPromise()
      .then(val => {
        console.log(val);
      });
  }
}
