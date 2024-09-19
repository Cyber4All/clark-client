import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BUNDLING_ROUTES } from './bundling.routes';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LearningObject } from 'entity/learning-object/learning-object';
import { LibraryService } from 'app/core/library-module/library.service';

const DEFAULT_BUNDLE_NAME = 'CLARK_LEARNING_OBJECT.zip';
@Injectable({
  providedIn: 'root'
})
export class BundlingService {

  showDownloadModal = false;
  downloading = [];
  currentIndex = null;

  private headers = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private libraryService: LibraryService
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

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.currentIndex = index;
    this.downloading[index] = true;
    this.showDownloadModal = true;
    this.libraryService.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(object.id));
    this.downloading[index] = false;
  }
}
