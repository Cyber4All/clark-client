import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { FEATURED_ROUTES } from './featured.routes';
import { catchError } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { Query } from 'app/interfaces/query';
import * as querystring from 'querystring';
import { SEARCH_ROUTES } from '../learning-object-module/search/search.routes';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';

@Injectable({
  providedIn: 'root',
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

  constructor(
    private http: HttpClient,
    private learningObjectService: LearningObjectService
  ) {}

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
    console.log("Wondering if I'm ever in here");
    // Grabs featured Learning Objects from the Featured Database
    const objects = await this.http
      .get(FEATURED_ROUTES.GET_FEATURED_OBJECTS())
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((featured: any) => {
        const featuredObjects = featured.filter((object: any) => {
          if(object != null) {
            return object as LearningObject;
          } else {
            return featured[5] as LearningObject;
          }
        });
        this.featuredStore.featured = featuredObjects;
        if (featuredObjects.length === 5) {
          this.filterOutFeaturedObjects();
          this._mutationError$.next(true);
        }
        console.log("Featured Objects:");
        console.log(featuredObjects);
        return featuredObjects;
      });
      console.log("past THAT return statement");

    const promisedObjectsArray = objects.map(
      async (learningObject: LearningObject) => {
        // Grabs the complete Learning Object from the LO database
        // For some reason, the method itself returns the full Learning Object,
        //    but when entered into the array it turns into a Promise.
        const object = await this.learningObjectService.fetchLearningObject(
          learningObject.cuid,
          learningObject.version,
        );
        if (object.resourceUris?.outcomes) {
          // Retrieve the outcomes for the learning object with the resource uri
          const outcomePromise: any = await this.http
            .get(object.resourceUris.outcomes)
            .toPromise();
          // Resolve outcome promises
          object.outcomes = await Promise.all(outcomePromise).then(
            async (outcome: any) => {
              return outcome;
            },
          );
        } else {
          console.log('FIX ME: No outcomes found for learning object');
        }
        return object;
      },
    );

    // Resolves the array of Promises into an array of complete Learning Objects
    this.featuredStore.featured = await Promise.all(promisedObjectsArray).then(
      async (learningObject: LearningObject[]) => {
        return learningObject;
      },
    );
    // Save the array into the _featuredObjects subject to be observed
    this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
    this.setSubmitError();
  }

  filterOutFeaturedObjects() {
    this.featuredObjectIds = [];
    this.featuredStore.featured.forEach((object) => {
      this.featuredObjectIds.push(object.id);
    });
  }

  setSubmitError(){
    if (this.featuredStore.featured.length === 5) {
      this._submitError$.next(false);
      this._mutationError$.next(true);
    }
  }

  setFeatured(objects: LearningObject[]) {
    this.featuredStore.featured = objects;
    this.filterOutFeaturedObjects();
    console.log("HOW OFTEN DO WE CHECK HERE")
    this.setSubmitError();
    this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
  }

  removeFeaturedObject(featured: LearningObject) {
    this.featuredStore.featured = this.featuredStore.featured.filter(
      (object: LearningObject) => {
        return object.id !== featured.id;
      },
    );
    this.filterOutFeaturedObjects();
    if (this.featuredStore.featured.length !== 5) {
      this._mutationError$.next(false);
      this._submitError$.next(true);
    }
    this._featuredObjects$.next(Object.assign({}, this.featuredStore).featured);
  }

  async saveFeaturedObjects() {
    console.log("I am in the featured service");
    console.log( {learningObjects: this.featuredStore.featured})
    console.log( this.featuredStore.featured[0].cuid)
    const arr = [];
    this.featuredStore.featured.forEach((obj)=> {
      arr.push({cuid: obj.cuid, version: obj.version, featuredCollection: obj.collection})
    })
    if (this.featuredStore.featured.length !== 5) {
      console.log("Lenth is not 5");
      this._submitError$.next(true);
    } else {
      return this.http
        .patch(
          FEATURED_ROUTES.UPDATE_FEATURED_OBJECTS(),
          // { learningObjects: this.featuredStore.featured},
          { learningObjects: arr },
          { headers: this.headers, withCredentials: true },
        )
        .toPromise();
    }
  }

  /**
   * Fetches Array of Learning Objects that are not currently featured
   *
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   */
  getNotFeaturedLearningObjects(
    query?: Query,
  ): Promise<{ learningObjects: LearningObject[]; total: number }> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      const queryString = querystring.stringify(queryClone);
      route =
        SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS(queryString);
    } else {
      route = SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS();
    }

    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
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
  async getCollectionFeatured(collectionAbvName: string) {
    const response = await this.http
      .get(FEATURED_ROUTES.GET_COLLECTION_FEATURED_OBJECTS(collectionAbvName))
      .pipe(catchError(this.handleError))
      .toPromise();
    return response as LearningObject[];
  }

  /**
   * Get the featured learning objects for a collection with a limit
   *
   * @param collection
   * @param limit
   * @returns [LearningObject]
   */
  async getCollectionFeaturedWithLimit(collectionAbvName: string, limit: number) {
    const response = await this.http
      .get(FEATURED_ROUTES.GET_COLLECTION_FEATURED_OBJECTS(collectionAbvName, limit))
      .pipe(catchError(this.handleError))
      .toPromise();
    return response as LearningObject[];
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
