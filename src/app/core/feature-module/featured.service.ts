import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  LEGACY_FEATURED_ROUTES,
  LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES
} from '../learning-object-module/learning-object/learning-object.routes';
import { FEATURED_ROUTES } from './featured.routes';
import { catchError, retry } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { Query } from 'app/interfaces/query';
import * as querystring from 'querystring';
import { ProfileService } from '../user-module/profiles.service';

@Injectable({
  providedIn: 'root'
})
export class FeaturedObjectsService {
  private _featuredObjects$ = new BehaviorSubject<LearningObject[]>([]);
  // Errors that occur if the featuredObjects array cannot be added to or changed
  private _mutationError$ = new BehaviorSubject<boolean>(false);
  // Errors that occur if the featuredObjects array does not contain exactly 5 objects
  private _submitError$ = new BehaviorSubject<boolean>(false);
  private featuredStore: { featured } = { featured: [] };

  private headers = new HttpHeaders();
  featuredObjectIds: string[];

  constructor(private http: HttpClient,
    private profileService: ProfileService) { }

  get featuredObjects() {
    return this._featuredObjects$.asObservable();
  }
  get mutationError() {
    return this._mutationError$.asObservable();
  }
  get submitError() {
    return this._submitError$.asObservable();
  }

  /**
   * Gets 5 featured full learning objects and saves it in the _featuredObjects subject
   */
  async getFeaturedObjects() {
    // Grabs featured Learning Objects from the Featured Database
    const objects: LearningObject[] = await this.http
      .get(FEATURED_ROUTES.GET_FEATURED_OBJECTS())
      .pipe(
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
        return featuredObjects;
      });
    const promisedObjectsArray = objects.map(async (learningObject: LearningObject) => {
      // Grabs the complete Learning Object from the LO database
      // For some reason, the method itself returns the full Learning Object,
      //    but when entered into the array it turns into a Promise.
      const object = await this.profileService.fetchLearningObject({
        author: undefined,
        cuid: learningObject.cuid
      });
      // Retrieve the outcomes for the learning object with the resource uri
      const outcomePromise: any = await this.http.get(object.resourceUris.outcomes).toPromise();
      // Resolve outcome promises
      object.outcomes = await Promise.all(outcomePromise).then(async (outcome: any) => {
        return outcome;
      });
      return object;
    });
    // Resolves the array of Promises into an array of complete Learning Objects
    this.featuredStore.featured = await Promise.all(promisedObjectsArray).then(async (learningObject: LearningObject[]) => {
      return learningObject;
    });
    // Save the array into the _featuredObjects subject to be observed
    this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
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
      return this.http.patch(FEATURED_ROUTES.UPDATE_FEATURED_OBJECTS(),
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
  getNotFeaturedLearningObjects(query?: Query): Promise<{ learningObjects: LearningObject[], total: number }> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      const queryString = querystring.stringify(queryClone);
      route = LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(
        queryString
      );
    } else {
      route = LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    }

    return this.http
      .get(route)
      .pipe(

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
      .get(LEGACY_FEATURED_ROUTES.GET_COLLECTION_FEATURED(collection))
      .pipe(
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
