import { USER_ROUTES } from './../../../environments/route';
import { Injectable, OnInit } from '@angular/core';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Http, Headers, ResponseContentType } from '@angular/http';
import { saveAs as importedSaveAs } from 'file-saver';

@Injectable()
export class CartV2Service {

  private user = JSON.parse(localStorage.getItem('currentUser'));
  private headers = new Headers();

  public cartItems: Array<LearningObject> = [];

  constructor(private http: Http) {
    this.updateUser();
  }

  updateUser() {
    // get new user from localStorage
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    this.user = this.user ? this.user : false;

    // reset headers with new users auth token
    this.headers = new Headers();
    this.headers.append('Authorization', 'Bearer ' + this.user.token);

  }

  openLearningObject(url: string) {
    window.open(url);
  }

  getCart(reloadUser = false): Promise<Array<LearningObject>> | boolean {
    return (this.user) ? this.http
      .get(USER_ROUTES.GET_CART(this.user._username), { headers: this.headers, withCredentials: true })
      .toPromise()
      .then(val => {
        this.cartItems = <Array<LearningObject>>val.json();
        return this.cartItems;
      }) : false;
  }

  async addToCart(
    author: string,
    learningObjectName: string,
    download?: boolean
  ): Promise<Array<LearningObject> | boolean> {
    // tslint:disable-next-line:max-line-length
    return (this.user) ? this.http
      .post(
        USER_ROUTES.ADD_LEARNING_OBJECT_TO_CART(
          this.user._username,
          author,
          learningObjectName
        ),
        {},
        { headers: this.headers, withCredentials: true }
      )
      .toPromise()
      .then(async val => {
        this.cartItems = <Array<LearningObject>>val.json();
        return this.cartItems;
      }) : false;
  }

  removeFromCart(
    author: string,
    learningObjectName: string
  ): Promise<Array<LearningObject>> | boolean {
    // tslint:disable-next-line:max-line-length
    return (this.user) ? this.http
      .delete(
        USER_ROUTES.CLEAR_LEARNING_OBJECT_FROM_CART(
          this.user._username,
          author,
          learningObjectName
        ),
        { headers: this.headers, withCredentials: true }
      )
      .toPromise()
      .then(val => {
        this.cartItems = <Array<LearningObject>>val.json();
        return this.cartItems;
      }) : false;
  }

  clearCart(): Promise<boolean> | boolean {
    // tslint:disable-next-line:curly
    if (this.user) {
      return this.http
        .delete(USER_ROUTES.CLEAR_CART(this.user._username), { headers: this.headers, withCredentials: true })
        .toPromise().then(val => {
          this.cartItems = [];
          return true;
        });
    } else {
      return false;
    }
  }

  checkout() {
    // tslint:disable-next-line:max-line-length
    this.http.get(USER_ROUTES.GET_CART(this.user._username) + '?download=true', { headers: this.headers, responseType: ResponseContentType.Blob, withCredentials: true })
      .subscribe((res) => {
        importedSaveAs(res.blob(), `${Date.now()}.zip`);
      },
        (err) => console.log,
        () => { console.log('Downloaded'); });
  }

  downloadLearningObject(author: string, learningObjectName: string) {
    this.http.post(USER_ROUTES.DOWNLOAD_OBJECT(this.user._username, author, learningObjectName), {},
      { headers: this.headers, responseType: ResponseContentType.Blob })
      .subscribe((res) => {
        importedSaveAs(res.blob(), `${Date.now()}.zip`);
      },
        (err) => console.log,
        () => { console.log('Downloaded'); });
  }
}
