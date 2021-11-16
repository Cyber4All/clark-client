import { USER_ROUTES } from '@env/route';
import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

export const iframeParentID = 'learning-object-download';
@Injectable()
export class LibraryService {
  private user;
  private headers = new HttpHeaders();

  public libraryItems: Array<LearningObject> = [];

  // Observable boolean to toggle download spinner in components
  private _loading$ = new BehaviorSubject<boolean>(false);

  // Public get for loading observable
  get loaded() {
    return this._loading$.asObservable();
  }

  constructor(private http: HttpClient, private auth: AuthService, public toaster: ToastrOvenService) {
    this.updateUser();
  }

  updateUser() {
    // get new user from auth service
    this.user = this.auth.user || undefined;

    // reset headers with new users auth token
    this.headers = new HttpHeaders();
    // this.headers.append('Content-Type', 'application/json');
  }

  getLibrary(page?: number, limit?: number, reloadUser = false): Promise<{ cartItems: LearningObject[], lastPage: number }> {
    if (!this.user) {
      return Promise.reject('User is undefined');
    }

    return this.http
      .get(USER_ROUTES.GET_CART(this.user.username, page, limit), {
        withCredentials: true,
        headers: this.headers
      })
      .pipe(
        retry(3),
        catchError((error) => this.handleError(error))
      )
      .toPromise()
      .then((val: any) => {
        this.libraryItems = val.userLibraryItems.map(object => new LearningObject(object.learningObject));
        return { cartItems: this.libraryItems, lastPage: val.lastPage };
      });
  }

  async addToLibrary(
    author: string,
    learningObject: LearningObject
  ): Promise<any> {
    if (!this.user) {
      return Promise.reject('User is undefined');
    }
    return await this.http
      .post(
        USER_ROUTES.ADD_LEARNING_OBJECT_TO_CART(
          this.user.username
        ),
        {
          authorUsername: author,
          cuid: learningObject.cuid,
          version: learningObject.version
        },
        { headers: this.headers, withCredentials: true }
      )
      .toPromise();
  }

  removeFromLibrary(cuid: string): Promise<void> {
    if (!this.user) {
      return Promise.reject('User is undefined');
    }
    this.http
      .delete(
        USER_ROUTES.CLEAR_LEARNING_OBJECT_FROM_CART(
          this.user.username,
          cuid
        ),
        { headers: this.headers, withCredentials: true }
      )
      .pipe(
        retry(3),
        catchError((error) => this.handleError(error))
      )
      .toPromise();
  }

  /**
   * Service function to download a learning object bundle.
   * The call to download the bundle is made in @function downloadBundle()
   *
   * @param author the author username of the learning object
   * @param learningObjectId the mongo id of the learning object
   */
  learningObjectBundle(
    author: string,
    learningObjectId: string
  ) {
    // Show loading spinner
    this._loading$.next(true);
    // Url route for bundling
    const bundle = USER_ROUTES.OBJECT_BUNDLE(
      author,
      learningObjectId
    );
    /**
     * 1. HEAD hits the bundle 'GET' route and receieves response code
     * 2. Error is caught and piped
     * 3. Call @function downloadBundle() to start local bundle download
     */
    this.http.head(bundle, {
      headers: this.headers,
      withCredentials: true
    }).pipe(
      catchError((error) => this.handleError(error))
    )
    .subscribe(() => {
      this.toaster.success('All Ready!', 'Your download will begin in a moment...');
      this.downloadBundle(bundle);
    });
  }

  /**
   * Function to create a hidden page element to download a bundle
   *
   * @param url URL string for bundle download
   */
  downloadBundle(
    url: string
  ) {
    // Create the iframe HTML element
    const iframe = document.createElement('iframe');
    // Hide the iframe
    iframe.setAttribute('style', 'none');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-downloads');
    iframe.setAttribute('id', iframeParentID);
    // Append iframe to the page
    document.body.appendChild(iframe);
    // Retrieve bundle from service
    iframe.src = url;
    // Toggle off loading spinner
    this._loading$.next(false);
  }

  has(object: LearningObject): boolean {
    const inLibrary = this.libraryItems.filter(
      o =>
        o.cuid === object.cuid
    ).length > 0;
    return inLibrary;
  }

  private handleError(error: HttpErrorResponse) {
    // Toggle off loading spinner *** needs to stay here in case error is thrown in http HEAD request ***
    this._loading$.next(false);
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else if (error.status === 425) {
      // At time of implementation, 425 is recgonized as an experimental status
      this.toaster.warning('Hang Tight!', 'We need to bundle your learning object, check back shortly to see if it has finished bundling.');
    } else {
      // API returned error
      return throwError(error);
    }
  }
}

