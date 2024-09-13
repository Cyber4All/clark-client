import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BUNDLING_ROUTES } from './bundling.routes';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LibraryService } from 'app/core/library-module/library.service';
import { LearningObject } from 'entity/learning-object/learning-object';

@Injectable({
  providedIn: 'root'
})

export class BundlingService {
  private headers = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private libraryService: LibraryService
  ) { }

  showDownloadModal = false;
  currentIndex = null;
  downloading = false;

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

  toggleBundle(
    learningObjectId: string,
    fileIDs: string[],
    state: boolean
  ) {
    const route = BUNDLING_ROUTES.TOGGLE_BUNDLE_FILE({ learningObjectId });

    return this.http
      .patch(
        route,
        {
          fileIDs: fileIDs,
          packagable: state
        },
        { headers: this.headers, withCredentials: true }
      )
      .pipe(

        catchError(this.handleError)
      )
      .toPromise();
  }


  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
  }

  download(learningObjectId: string) {
    this.toggleDownloadModal(true);
    this.libraryService.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(learningObjectId));
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
