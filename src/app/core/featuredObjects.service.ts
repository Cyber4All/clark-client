import { Injectable } from '@angular/core';
import { LearningObject } from '@entity';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FEATURED_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Query } from 'app/interfaces/query';
import * as querystring from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class FeaturedObjectsService {

  private headers = new HttpHeaders();

  constructor(private http: HttpClient) { }

  async getFeaturedObjects(): Promise<LearningObject[]> {
    return this.http
      .get(FEATURED_ROUTES.GET_FEATURED)
      .pipe(
        retry(3),
        catchError(this.handleError)
      ).toPromise()
      .then((featured: any) => {
        const featuredObjects = featured.map(object => new LearningObject(object));
        return featuredObjects;
      });
  }

  async setFeaturedObjects(learningObjects: LearningObject[]): Promise<any> {
    if (learningObjects.length !== 5) {
      throw new Error('Featured Learning Objects must contain 5 Learning Objects');
    } else if (learningObjects.length === 5) {
      try {
        this.http.patch(FEATURED_ROUTES.SET_FEATURED,
          {
            learningObjects: learningObjects,
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
  getNotFeaturedLearningObjects(featured: LearningObject[], query?: Query): Promise<{learningObjects: LearningObject[], total: number}> {
    let route = '';
    if (query) {
      const queryClone = Object.assign({}, query);
      if (
        queryClone.standardOutcomes &&
        queryClone.standardOutcomes.length &&
        typeof queryClone.standardOutcomes[0] !== 'string'
      ) {
        queryClone.standardOutcomes = (<string[]>(
          queryClone.standardOutcomes
        )).map(o => o['id']);
      }
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
        const learningObjects = this.filterOutFeatured(featured, objects);
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
