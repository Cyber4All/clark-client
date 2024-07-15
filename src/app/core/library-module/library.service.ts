import { Injectable } from '@angular/core';
import { LearningObject } from '../../../entity/learning-object/learning-object';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth-module/auth.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrOvenService } from '../../shared/modules/toaster/notification.service';
import { LIBRARY_ROUTES } from './library.routes';
import { BUNDLING_ROUTES } from '../learning-object-module/bundling/bundling.routes';

export const iframeParentID = 'learning-object-download';
@Injectable({
  providedIn: 'root'
})
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

  async getLibrary(page?: number, limit?: number): Promise<{ cartItems: LearningObject[], lastPage: number }> {
    this.updateUser();
    if (!this.user) {
      return Promise.reject('User is undefined');
    }

    const query = new URLSearchParams({
      page: page ? page.toString() : '1',
      limit: limit ? limit.toString() : '10',
    });

    return await this.http
      .get(LIBRARY_ROUTES.GET_USERS_LIBRARY(this.user.username, query), {
        withCredentials: true,
        headers: this.headers
      })
      .pipe(
        catchError((error) => this.handleError(error))
      )
      .toPromise()
      .then((val: any) => {
        this.libraryItems = val.userLibraryItems.map(object => new LearningObject(object.learningObject));
        return { cartItems: this.libraryItems, lastPage: val.lastPage };
      });
  }

  async addToLibrary(
    cuid: string, version: number
  ): Promise<any> {
    if (!this.user) {
      return Promise.reject('User is undefined');
    }
    return await this.http
      .post(
        LIBRARY_ROUTES.ADD_LEARNING_OBJECT_TO_LIBRARY(
          this.user.username
        ),
        {
          cuid,
          version
        },
        { headers: this.headers, withCredentials: true }
      )
      .pipe(
        catchError((error) => {
          // Check if the error is a 409 conflict error
          if (error.status === 409) {
            // Log the error or handle it as needed
            console.log('Conflict error (409) occurred, but proceeding without throwing.');
            // Return an observable that completes without emitting, effectively "skipping" the error
            return of(null);
          }
          // For other errors, re-throw them or handle them as needed
          return throwError(error);
        })
      )
      .toPromise();
  }

  removeFromLibrary(learningObjectId: string): Promise<void> {
    if (!this.user) {
      return Promise.reject('User is undefined');
    }
    this.http
      .delete(
        LIBRARY_ROUTES.REMOVE_LEARNING_OBJECT_FROM_LIBRARY(
          this.user.username,
          learningObjectId
        ),
        { headers: this.headers, withCredentials: true }
      )
      .pipe(

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
    learningObjectId: string
  ) {
    // Show loading spinner
    this._loading$.next(true);
    // Url route for bundling
    const bundle = BUNDLING_ROUTES.BUNDLE_LEARNING_OBJECT(
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
        this.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(learningObjectId));
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
    iframe.setAttribute('sandbox', 'allow-same-origin allow-downloads');
    iframe.setAttribute('id', iframeParentID);
    iframe.style.visibility = 'hidden';
    iframe.style.position = 'fixed';
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
      this.toaster.warning(
        'Hang Tight!',
        `The download for this learning object isn't ready yet, check back shortly to see if it has finished bundling.`
      );
    } else {
      // API returned error
      return throwError(error);
    }
  }
}

