import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { LearningObject } from '../../../entity/learning-object/learning-object';
import { ToastrOvenService } from '../../shared/modules/toaster/notification.service';
import { AuthService } from '../auth-module/auth.service';
import { LIBRARY_ROUTES } from './library.routes';
import { environment } from '@env/environment';

export interface LibraryItem { _id: string, savedBy: string, savedOn: string, learningObject: LearningObject }

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private user;
  private headers = new HttpHeaders();
  public libraryItems: Array<LibraryItem> = [];

  // Observable boolean to toggle download spinner in components
  private _loading$ = new BehaviorSubject<boolean>(false);

  // Public get for loading observable
  get loaded() {
    return this._loading$.asObservable();
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public toaster: ToastrOvenService
  ) {
    this.updateUser();
  }

  /**
   * Method to update the user object and headers with the latest user information
   */
  updateUser() {
    // get new user from auth service
    this.user = this.auth.user || undefined;

    // reset headers with new users auth token
    this.headers = new HttpHeaders();
  }

  /**
   *
   * @param opts
   * @returns
   */
  async getLibrary(opts: {
    learningObjectCuid?: string,
    version?: number,
    page?: number,
    limit?: number
  }): Promise<{ libraryItems: LibraryItem[], lastPage: number }> {
    // Resets the auth token in the headers
    this.updateUser();
    if (!this.user) {
      return;
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
        this.libraryItems = val.userLibraryItems
          .map((libraryItem) => {
            const learningObject = new LearningObject(libraryItem.learningObject);
            learningObject.id = libraryItem.learningObject?._id;

            return {
              _id: libraryItem._id,
              savedBy: libraryItem.savedBy,
              savedOn: libraryItem.savedOn,
              learningObject
            };
          });
        return { libraryItems: this.libraryItems, lastPage: val.lastPage };
      });
  }

  async addToLibrary(
    cuid: string, version: number
  ): Promise<any> {
    if (!this.user) {
      return;
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

  removeFromLibrary(libraryItemId: string): Promise<void> {
    if (!this.user) {
      return;
    }
    this.http
      .delete(
        LIBRARY_ROUTES.REMOVE_LEARNING_OBJECT_FROM_LIBRARY(
          this.user.username,
          libraryItemId
        ),
        { headers: this.headers, withCredentials: true }
      )
      .pipe(catchError((error) => this.handleError(error)))
      .toPromise();
  }

  /**
   * Method to start bundle stream and download the zip file
   * @param url request to api for zip in stream
   * @returns void - blob stream is downloaded to user's machine
   */
  async downloadBundle(url: string): Promise<void> {
    return this.http.get<{ url: string }>(
      url, {
      responseType: 'json',
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
      .then((response: HttpResponse<{ url: string }>) => {
        /**
         * We get the pre-signed download URL from the response body, check if the download URL is empty,
         * then open the download URL in a new tab and begin downloading the bundle from S3.
         */
        const { url } = response.body;
        if (!url) {
          // Ideally we should NEVER reach this null case, or else something has gone
          // really wrong with S3 or clark-service, as we would 404 when an object does not exist.
          throw this.handleError(new HttpErrorResponse({ error: 'No URL for content download', status: 500 }));
        }
        window.open(url);
      });
  }

  /**
   * Returns whether the learning object exists in the user's library
   * This is done by checking the library items for the learningObjectId
   *
   * @param learningObjectId the learning object to check for in the library
   * @returns whether the learning object exists in the library
   */
  has(learningObjectId: string): boolean {
    return this.libraryItems.filter((libraryItem: LibraryItem) => libraryItem.learningObject.id === learningObjectId).length > 0;
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

