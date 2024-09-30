import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LearningObject } from '@entity';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Query } from 'app/interfaces/query';
import { SEARCH_ROUTES } from 'app/core/learning-object-module/search/search.routes';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  /**
   * Searches and returns an array of Learning Objects that are/are not currently featured
   * @param {Query} [query] - Optional parameter containing search query parameters to filter the Learning Objects
   * @param {Object} [options] - Optional object to customize the search behavior
   * @param {boolean} [options.handleStandardOutcomes=true] - Use this when you need to extract the id before sending the query
   * @param {boolean} [options.mapToLearningObjectInstance=true] - Set false when you need to receive raw objects instead of LearningObject
   * @returns {Promise<LearningObject[]>}
   * @memberof LearningObjectService
   * */

  searchLearningObjects(
    query?: Query,
    options?: {
      handleStandardOutcomes?: boolean;
      mapToLearningObjectInstance?: boolean;
    },
  ): Promise<{ learningObjects: LearningObject[] | any[]; total: number }> {
    // Set default options if not provided
    const {
      handleStandardOutcomes = true,
      mapToLearningObjectInstance = true,
    } = options || {};

    let route = '';
    if (query) {
      const queryClone = { ...query };

      // Handle standard outcomes if the option is enabled
      if (
        handleStandardOutcomes &&
        queryClone.standardOutcomes &&
        queryClone.standardOutcomes.length &&
        typeof queryClone.standardOutcomes[0] !== 'string'
      ) {
        queryClone.standardOutcomes = queryClone.standardOutcomes.map(
          (o) => o['id'],
        );
      }

      const queryString = new URLSearchParams(queryClone as any).toString();
      route = SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS(queryString);
    } else {
      route = SEARCH_ROUTES.SEARCH_LEARNING_OBJECTS();
    }

    return this.http
      .get(route)
      .pipe(catchError(this.handleError))
      .toPromise()
      .then((response: any) => {
        const objects = response.objects;
        const total = response.total;

        // Map to LearningObject instances if the option is enabled
        const learningObjects = mapToLearningObjectInstance
          ? objects.map((object: any) => new LearningObject(object))
          : objects;

        return { learningObjects, total };
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
