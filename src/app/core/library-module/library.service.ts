import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { LearningObject } from '../../../entity/learning-object/learning-object';
import { ToastrOvenService } from '../../shared/modules/toaster/notification.service';
import { AuthService } from '../auth-module/auth.service';
import { BUNDLING_ROUTES } from '../learning-object-module/bundling/bundling.routes';
import { LIBRARY_ROUTES } from './library.routes';

const DEFAULT_BUNDLE_NAME = 'CLARK_LEARNING_OBJECT.zip';
@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private user;
  private headers = new HttpHeaders();
  private cartItems: Array<any> = [];
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

  async getLibrary(opts?: {
    learningObjectCuid?: string, version?: number,
    page?: number, limit?: number
  }): Promise<{ cartItems: LearningObject[], lastPage: number }> {
    this.updateUser();
    if (!this.user) {
      return Promise.reject('User is undefined');
    }

    const query = new URLSearchParams({
      page: opts.page ? opts.page.toString() : '1',
      limit: opts.limit ? opts.limit.toString() : '10',
      cuid: opts.learningObjectCuid ? opts.learningObjectCuid : '',
      version: opts.version ? opts.version.toString() : '0'
    });

    return await this.http
      .get(LIBRARY_ROUTES.GET_USERS_LIBRARY(this.user.username, query), {
        withCredentials: true,
        headers: this.headers,
      })
      .pipe(
        catchError((error) => this.handleError(error))
      )
      .toPromise()
      .then((val: any) => {
        // preserves carts from cartsdb
        this.cartItems = val.userLibraryItems;
        this.libraryItems = val.userLibraryItems
          .map(object => {
            if (object.learningObject) {
              object.learningObject.id = object.learningObject._id;
            }
            return new LearningObject(object.learningObject);
          });
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
    const cartId = this.cartItems
    .filter(cart => cart.learningObject && cart.learningObject._id === learningObjectId)
    .map(cart => cart._id)[0];
    console.log(cartId);
    this.http
      .delete(
        LIBRARY_ROUTES.REMOVE_LEARNING_OBJECT_FROM_LIBRARY(
          this.user.username,
          cartId
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
   * @param learningObjectId the mongo id of the learning object
   */
  learningObjectBundle(learningObjectId: string) {
    // Show loading spinner
    this._loading$.next(true);

    // Url route for bundling
    const bundleUrl = BUNDLING_ROUTES.BUNDLE_LEARNING_OBJECT(learningObjectId);
    const downloadUrl = BUNDLING_ROUTES.DOWNLOAD_BUNDLE(learningObjectId);

    this.http.head(bundleUrl, {
      headers: this.headers,
      withCredentials: true
    }).pipe(
      catchError((error) => {
        this._loading$.next(false);
        return this.handleError(error);
      })
    ).subscribe(
      () => {
        this.toaster.success('All Ready!', 'Your download will begin in a moment...');
        this.downloadBundle(downloadUrl).then(
          () => {
            this._loading$.next(false);
          },
          (error) => {
            this._loading$.next(false);
            this.toaster.error('Download failed', error.message);
          }
        );
      },
      (error) => {
        this._loading$.next(false);
        this.toaster.error('Preparation failed', error.message);
      }
    );
  }

  /**
   * Method to start bundle stream and download the zip file
   * @param url request to api for zip in stream
   * @returns void - blob stream is downloaded to user's machine
   */
  async downloadBundle(url: string): Promise<void> {
    return this.http.get(
      url, {
      responseType: 'blob',
      observe: 'response',
      headers: this.headers,
      withCredentials: true,
    })
      .pipe(
        timeout(30000), // 30 seconds timeout
        catchError(error => {
          throw this.handleError(error);
        })
      )
      .toPromise()
      .then((response: HttpResponse<Blob>) => {
        // Get the content disposition header from the response
        const contentDisposition = response.headers.get('content-disposition');
        // Get the blob from the response
        const blob = response.body;
        // Validate that the blob is not empty
        if (!blob) {
          throw this.handleError(new HttpErrorResponse({ error: 'No content in response body', status: 500 }));
        }
        // Create an element on the DOM to download the zip file
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        // REQUIRED: Set the download attribute to the name of the file
        link.download = this.getBundleName(contentDisposition);
        document.body.appendChild(link);
        // Trigger the download
        link.click();
        // Remove the element from the DOM
        document.body.removeChild(link);
        // Revoke the object URL to prevent memory leaks
        window.URL.revokeObjectURL(link.href);
      });
  }

  has(object: LearningObject): boolean {
    const inLibrary = this.libraryItems.filter(
      o =>
        o.cuid === object.cuid
    ).length > 0;
    return inLibrary;
  }

  /**
   * Method to extract the bundle name from the content disposition header
   * @param contentDisposition content disposition header
   * @attribute filename standard attribute for content disposition header
   * @returns name of the bundle zip file
   */
  private getBundleName(contentDisposition: string): string {
    // If no content disposition header, return default name
    if (!contentDisposition) {
      return DEFAULT_BUNDLE_NAME;
    }
    // Split the content disposition header by semicolon
    const split = contentDisposition.split(';');
    for (const part of split) {
      const [key, value] = part.trim().split('=');
      // Match only the filename key
      if (key === 'filename') {
        return value.replace(/"/g, '').trim();
      }
    }
    // Return default bundle name if no filename key found
    return DEFAULT_BUNDLE_NAME;
  }

  private handleError(error: HttpErrorResponse) {
    // Toggle off loading spinner *** needs to stay here in case error is thrown in http HEAD request ***
    this._loading$.next(false);
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else if (error.status === 425) {
      // At time of implementation, 425 is recognized as an experimental status
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

