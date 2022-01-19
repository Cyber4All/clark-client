import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FEATURED_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { catchError, retry } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { Query } from 'app/interfaces/query';
import * as querystring from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class FeaturedObjectsService {
  private _featuredObjects$ = new BehaviorSubject<LearningObject[]>([]);
  // Errors that occur if the featuredObjects array cannot be added to or changed
  private _mutationError$ = new BehaviorSubject<boolean>(false);
  // Errors that occur if the featuredObjects array does not contain exactly 5 objects
  private _submitError$ = new BehaviorSubject<boolean>(false);
  private featuredStore: { featured } = { featured: []};

  private headers = new HttpHeaders();
  featuredObjectIds: string[];

  constructor(private http: HttpClient) { }

  get featuredObjects() {
    return this._featuredObjects$.asObservable();
  }
  get mutationError() {
    return this._mutationError$.asObservable();
  }
  get submitError() {
    return this._submitError$.asObservable();
  }

  async getFeaturedObjects() {
    return await this.http
      .get(FEATURED_ROUTES.GET_FEATURED)
      .pipe(
        retry(3),
        catchError(this.handleError)
      ).toPromise()
      .then((featured: any) => {
        const featuredObjects = featured.map(object => {
          object.collection = object.collectionName;
          return object;
        });
        this.featuredStore.featured = featuredObjects;
        if (featuredObjects.length === 5) {
          this.filterOutFeaturedObjects();
          this._mutationError$.next(true);
        } else if (featuredObjects.length !== 5) {
          this._submitError$.next(true);
        }
        this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
      });
  }

  filterOutFeaturedObjects() {
    this.featuredObjectIds = [];
    this.featuredStore.featured.forEach(object => {
      this.featuredObjectIds.push(object.id);
    });
  }

  setFeatured(objects) {
    this.featuredStore.featured = objects;
    this.filterOutFeaturedObjects();
    if (this.featuredStore.featured.length === 5) {
      this._submitError$.next(false);
      this._mutationError$.next(true);
    }
    this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
  }

  removeFeaturedObject(featured) {
    this.featuredStore.featured = this.featuredStore.featured.filter(object => {
      return object.id !== featured.id;
    });
    this.filterOutFeaturedObjects();
    if (this.featuredStore.featured.length !== 5) {
      this._mutationError$.next(false);
      this._submitError$.next(true);
    }
    this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
  }

  async saveFeaturedObjects() {
    if (this.featuredStore.featured.length !== 5) {
      this._submitError$.next(true);
    } else {
        return this.http.patch(FEATURED_ROUTES.SET_FEATURED,
          this.featuredStore.featured,
          { headers: this.headers, withCredentials: true }
        ).toPromise();
    }
  }

  /**
   * Fetches Array of Learning Objects that are not currently featured
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  getNotFeaturedLearningObjects(query?: Query): Promise<{learningObjects: LearningObject[], total: number}> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      const queryString = querystring.stringify(queryClone);
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(
        queryString
      );
    } else {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    }

    return this.http
      .get(route)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((response: any) => {
        return { learningObjects: response.objects, total: response.total };
      });
  }


  /** COLLECTION FEATURED ROUTES */

  /**
   * Get the featured learning objects for a collection
   *
   * @param collection
   * @returns [LearningObject]
   */
  getCollectionFeatured(collection: string) {
    return this.http
      .get(FEATURED_ROUTES.GET_COLLECTION_FEATURED(collection))
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise()
      .then((response: any) => {
        return response;
      });
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
