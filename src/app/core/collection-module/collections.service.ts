import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  LEGACY_COLLECTIONS_ROUTES
} from '../../core/learning-object-module/learning-object/learning-object.routes';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, skipWhile } from 'rxjs/operators';
import { COLLECTION_ROUTES } from './collections.routes';
import { REPORT_ROUTES } from '../report-module/report.routes';

export interface Collection {
  name: string;
  abvName: string;
  hasLogo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private collections: Collection[];
  private loading$ = new BehaviorSubject<boolean>(true);
  private headers: HttpHeaders = new HttpHeaders();
  darkMode502 = new BehaviorSubject<boolean>(true);
  constructor(private http: HttpClient) {
    this.getAllCollections();
  }

  /**
   * Service call to retrieve collection meta data for all objects for a particular user
   *
   * @param username username of the user's profile being accessed
   * @returns {cuid: string, version: int, status: string, collection: string} object metadata
   * for each collection an object belongs to for a user
   */
  // FIXME: Clark-service throws 404 for unrelased LOs b/c they don't have a collection; however mike says is fine, we need dis
  getUserSubmittedCollections(username: string): Promise<any> {
    return this.http
      .get(COLLECTION_ROUTES.GET_USER_SUBMITTED_COLLECTIONS(username), {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  /**
   * Fetches the list of collections from the API
   */
  async getAllCollections() {
    this.collections = await this.http
      .get(
        COLLECTION_ROUTES.GET_ALL_COLLECTIONS(),
        { withCredentials: true }
      )
      .pipe(
        catchError(this.handleError)
      )
      .toPromise()
      .then(async (collections: Collection[]) => {
        for (const c of collections) {
          c.hasLogo = false;

          try {
            await this.http.head('../../assets/images/collections/' + c.abvName + '.png')
              .toPromise()
              .then(() => {
                c.hasLogo = true;
              });
          } catch (error) {
            console.log(error);
            // the image doesn't exist, we don't need to do anything here since this is an expected error in many cases
          }
        }
        return collections;
      });
    this.loading$.next(false);
  }

  /**
   * Retrieve a list of collections
   *
   * @return {Collection[]} list of collections
   */
  async getCollections(): Promise<Collection[]> {
    if (this.loading$.value) {
      // If the service is loading collections, create a promise that will
      // resolve the collections once the value of loading is false
      const p = new Promise<Collection[]>(resolve => {
        this.loading$
          .pipe(
            skipWhile(val => val === true)
          )
          .subscribe(val => {
            resolve(this.collections);
          });
      });
      return await p;
    } else {
      return this.collections;
    }
  }

  async getCollection(abvName: string): Promise<Collection> {
    return await this.getCollections().then(val => {
      for (const x of val) {
        if (x.abvName === abvName) {
          return x;
        }
      }
    });
  }

  getCollectionCuratorsInfo(name: string) {
    return this.http.get(LEGACY_COLLECTIONS_ROUTES.GET_COLLECTION_CURATORS(name))
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
  }

  getCollectionMetadata(name: string) {
    return this.http.get(LEGACY_COLLECTIONS_ROUTES.GET_COLLECTION_META(name))
      .pipe(
        catchError(this.handleError)
      )
      .toPromise();
  }

  changeStatus502(status: boolean) {
    if (this.darkMode502.getValue() !== status) {
      this.darkMode502.next(status);
    }
  }

  async generateCollectionReport(
    collections: string[],
    email: string,
    name: string,
    date?: {
      start: string,
      end: string
    }) {
    if (collections.length > 0) {
      const route = REPORT_ROUTES.GENERATE_REPORT(collections, date);
      this.http
        .post(
          route,
          {
            email,
            name
          },
          { headers: this.headers, withCredentials: true }
        )
        .pipe(
          catchError(this.handleError)
        )
        .toPromise();
    }
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
