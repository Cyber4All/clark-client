import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TAGS_ROUTES } from './tags.routes';
import { Observable, throwError } from 'rxjs';
import { Tag } from '@entity';
import { catchError } from 'rxjs/operators';
import { TagType } from 'entity/tag/tag';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  constructor(private http: HttpClient) {}

  public async getTags(): Promise<{ tags: Tag[] }> {
    return await this.http
      .get<{ tags: Tag[] }>(TAGS_ROUTES.GET_TAGS())
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  public async getTagTypes(): Promise<{
    types: { name: string; value: TagType }[];
  }> {
    return await this.http
      .get<{
        types: { name: string; value: TagType }[];
      }>(TAGS_ROUTES.GET_TAG_TYPES())
      .pipe(catchError(this.handleError))
      .toPromise();
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
