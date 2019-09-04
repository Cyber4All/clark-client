import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UriRetrieverService {

  constructor(private http: HttpClient) { }

  getLearningObject(options: array) {
    
  }
  /**
   * @param uri this is the uri that should be hit to get the objects outcomes
   */
  getLearningObjectOutcomes(uri: string): Observable<any> {
    return null;
  }
  /**
   * @param uri this is the uri that should be hit to get the objects children
   */
  getLearningObjectChildren(uri: string): Observable<any> {
    return null;
  }
  /**
   *
   * @param uri this is the uri that hsould be hit to get the objects materials
   */
  getLearningObjectMaterials(uri: string): Observable<any> {
    return null;
  }

  /**
   * @param uri this is the uri that should be hit to get the object's metrics
   */
  getLearningObjectMetrics(uri: string): Observable<any> {
    return null;
  }

  /**
   * @param uri this is the uri that should be hit to get the object's parents
   */
  getLearningObjectParents(uri: string): Observable<any> {
    return null;
  }

  /**
   * @param uri this is the uri that should be hit to get the object's ratings
   */
  getLearningObjectRatings(uri: string): Observable<any> {
    return null;
  }
}
