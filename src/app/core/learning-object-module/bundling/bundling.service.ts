import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BUNDLING_ROUTES } from './bundling.routes';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export const DownloadBundleToggle = {
  callDownloadBundle(learningObjectId: string) {
    const value = BUNDLING_ROUTES.BUNDLE_LEARNING_OBJECT(learningObjectId);
    return value;
  },
  callBundleLearningObject(learningObjectId: string) {
    const value = BUNDLING_ROUTES.BUNDLE_LEARNING_OBJECT(learningObjectId);
    return value;
  },
  // callTOGGLE_BUNDLE_FILE(params: { learningObjectId: string }){
  //   BUNDLING_ROUTES.TOGGLE_BUNDLE_FILE({learningObjectId});
  // }

};
export class BundlingService {
  private headers = new HttpHeaders();

  constructor(
    private http: HttpClient,
  ) { }

  async bundleLearningObject(learningObjectId: string): Promise<void> {
    this.http
      .post(BUNDLING_ROUTES.BUNDLE_LEARNING_OBJECT(learningObjectId),
        {},
        {
          headers: this.headers,
          withCredentials: true,
        }
      )
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  private handleError(error: HttpErrorResponse) {
    if (
      error.error instanceof ErrorEvent ||
      (error.error && error.error.message)
    ) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}
