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
  private featuredStore: { featured: LearningObject[] } = { featured: []};

  private headers = new HttpHeaders();

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
    return this.http
      .get(FEATURED_ROUTES.GET_FEATURED)
      .pipe(
        retry(3),
        catchError(this.handleError)
      ).toPromise()
      .then((featured: any) => {
        const featuredObjects = featured.map(object => new LearningObject(object));
        this.featuredStore.featured = featuredObjects;
        this._mutationError$.next(true);
        this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
      });
  }

  setFeatured(objects: LearningObject[]) {
    this.featuredStore.featured = objects;
    if (this.featuredStore.featured.length === 5) {
      this._submitError$.next(false);
      this._mutationError$.next(true);
    }
    this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
  }

  removeFeaturedObject(featured: LearningObject) {
    this.featuredStore.featured = this.featuredStore.featured.filter(object => {
      return object.id !== featured.id;
    });
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
      try {
        this.http.patch(FEATURED_ROUTES.SET_FEATURED,
          {
            learningObjects: this.featuredStore.featured,
          },
          { headers: this.headers, withCredentials: true }
        ).toPromise();
      } catch (e) {
        throw e;
      }
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
        const objects = response.objects;
        const learningObjects = this.filterOutFeatured(this.featuredStore.featured, objects);
        return { learningObjects: learningObjects, total: learningObjects.length };
      });
  }

  /**
   * Filters out the featured Learning Objects from general list of Learning Objects
   * @param featured Array of learning objects that are currently featured
   * @param learningObjects Array of learning objects returned from API
   */
  filterOutFeatured(featured: LearningObject[], learningObjects: LearningObject[]): LearningObject[] {
    const featuredIds = [];
    featured.forEach(feature => {
      featuredIds.push(feature.id);
    });
    const filtered = learningObjects.filter(object => {
        return !featuredIds.includes(object.id);
    });
    return filtered;
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
