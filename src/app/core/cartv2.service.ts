import { USER_ROUTES } from '@env/route';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { saveAs as importedSaveAs } from 'file-saver';
import { AuthService } from './auth.service';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export const iframeParentID = 'learning-object-download';
@Injectable()
export class CartV2Service {
  private user;
  private headers = new HttpHeaders();

  public cartItems: Array<LearningObject> = [];

  constructor(private http: HttpClient, private auth: AuthService) {
    this.updateUser();
  }

  updateUser() {
    // get new user from auth service
    this.user = this.auth.user || undefined;

    // reset headers with new users auth token
    this.headers = new HttpHeaders();
    // this.headers.append('Content-Type', 'application/json');
  }

  openLearningObject(url: string) {
    window.open(url);
  }

  getCart(reloadUser = false): Promise<LearningObject[]> {
    if (!this.user) {
      return Promise.reject('User is undefined');
    }

    return this.http
      .get(USER_ROUTES.GET_CART(this.user.username), {
        withCredentials: true,
        headers: this.headers
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((val: any) => {
        this.cartItems = val
          .map(object => new LearningObject(object));
        return this.cartItems;
      });
  }

  async addToCart(
    author: string,
    learningObjectName: string,
    download?: boolean
  ): Promise<LearningObject[]> {
    if (!this.user) {
      return Promise.reject('User is undefined');
    }
    return this.http
      .post(
        USER_ROUTES.ADD_LEARNING_OBJECT_TO_CART(
          this.user.username,
          author,
          learningObjectName
        ),
        {},
        { headers: this.headers, withCredentials: true }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then(async (val: any) => {
        try {
          this.cartItems = val.map(object => new LearningObject(object));
          return this.cartItems;
        } catch (error) {
          return Promise.reject('Error! ' + error);
        }
      });
  }

  removeFromCart(
    author: string,
    learningObjectName: string
  ): Promise<LearningObject[]> {
    // tslint:disable-next-line:max-line-length
    if (!this.user) {
      return Promise.reject('User is undefined');
    }
    return this.http
      .delete(
        USER_ROUTES.CLEAR_LEARNING_OBJECT_FROM_CART(
          this.user.username,
          author,
          learningObjectName
        ),
        { headers: this.headers, withCredentials: true }
      )
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((val: any) => {
        this.cartItems = val
          .map(object => new LearningObject(object));
        return this.cartItems;
      });
  }

  clearCart(): Promise<boolean> | boolean {
    // tslint:disable-next-line:curly
    if (this.user) {
      return this.http
        .delete(USER_ROUTES.CLEAR_CART(this.user.username), {
          headers: this.headers,
          withCredentials: true
        })
        .pipe(
          retry(3),
          catchError(this.handleError)
        )
        .toPromise()
        .then(val => {
          this.cartItems = [];
          return true;
        });
    } else {
      return false;
    }
  }

  checkout() {
    this.http
      .get(USER_ROUTES.GET_CART(this.user.username) + '?download=true', {
        headers: this.headers,
        responseType: 'blob',
        withCredentials: true
      })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .subscribe(
        res => {
          importedSaveAs(res, `${Date.now()}.zip`);
        },
        err => err,
        () => {}
      );
  }

  downloadLearningObject(
    author: string,
    learningObjectName: string,
    revisedVersion: boolean
  ): BehaviorSubject<boolean> {
    const url = USER_ROUTES.DOWNLOAD_OBJECT(
      author,
      learningObjectName
    );
    const revisedUrl = USER_ROUTES.DOWNLOAD_REVISED_OBJECT(
      author,
      learningObjectName
    );
    const iframe = document.createElement('iframe');
    if (revisedVersion) {
      iframe.src = revisedUrl;
    } else {
      iframe.src = url;
    }
    iframe.setAttribute('style', 'visibility:hidden;position:fixed;');

    const loaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
      false
    );
    try {
      iframe.onload(<any>loaded.next(true));
    } catch (e) {
      // Will always throw an error, do not handle
    }
    document.getElementById(iframeParentID).appendChild(iframe);
    return loaded;
  }

  iframeLoaded(this: HTMLIFrameElement, event: Event) {}

  has(object: LearningObject): boolean {
    return (
      this.cartItems.filter(
        o =>
          o.name === object.name && o.author.username === object.author.username
      ).length > 0
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}

const MAX_CHAR = 255;
export function sanitizeFileName(name: string): string {
  let clean = name.replace(/[\\/:"*?<>|]/gi, '_');
  if (clean.length > MAX_CHAR) {
    clean = clean.slice(0, MAX_CHAR);
  }
  return clean;
}
