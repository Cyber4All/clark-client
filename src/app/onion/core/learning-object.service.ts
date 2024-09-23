import { Injectable } from '@angular/core';
import {
  HttpHeaders,
} from '@angular/common/http';
import { LearningObject } from '@entity';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';
import { BundlingService } from 'app/core/learning-object-module/bundling/bundling.service';

@Injectable({
  providedIn: 'root'
})
export class LearningObjectService {
  learningObjects: LearningObject[] = [];
  private headers: HttpHeaders = new HttpHeaders();

  // Observable boolean to toogle download spinner in components
  private _loading$ = new BehaviorSubject<boolean>(false);

  // Public get for loading observable
  get loaded() {
    return this._loading$.asObservable();
  }

  constructor(
    private cookies: CookieService,
    private bundlingService: BundlingService,
  ) {
    const token = this.cookies.get('presence');
    if (token !== null) {
      this.headers = new HttpHeaders().append(
        'Authorization',
        `${'Bearer ' + token}`
      );
    }
  }

  /**
   * Function to initiate the bundling process for new and updated learning objects
   *
   * @param username Authors username of current learning object
   * @param learningObjectId id current learning object
   */
  // This level of abstraction is unnecessary and should be removed, call bundling service directly
  async triggerBundle(learningObjectId: string) {
    await this.bundlingService.bundleLearningObject(learningObjectId);
  }
}
