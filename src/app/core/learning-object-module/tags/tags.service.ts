import { Injectable } from '@angular/core';
import { Tag } from '@entity';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { TAGS_ROUTES } from './tags.routes';
import { TagType } from 'entity/tag/tag';
import { GetTagByNameResponse } from 'app/cube/shared/types/usage-stats';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private headers = new HttpHeaders();
  private tagsMap: Map<string, string> = new Map();

  constructor(private http: HttpClient) {
  }

  async getFromTagsMap(tagId?: string) {
    if (this.tagsMap.size === 0) {
      const tags = await this.getTags(); // grabs all tags
      if (tags) {
        tags.forEach(tag => {
          this.tagsMap.set(tag._id, tag.name);
        });
      } 
    }

    // return this.tagsMap;
    return tagId ? this.tagsMap.get(tagId) : "";
    
  }

  /**
   * This gets the list of object tags from the backend to display
   *
   * @returns A list of tags
   */
  async getTags(query?: any): Promise<Tag[]> {
    query = {
      type: query?.type,
      text: query?.text,
      sort: 1,
      limit: 40
    };
    return await new Promise((resolve, reject) => {
      this.http
        .get<Tag[]>(TAGS_ROUTES.GET_ALL_TAGS(query),
          {
            headers: this.headers,
            withCredentials: true,
          }
        )
        .pipe(

          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => {
            resolve(res.tags);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  /**
   *  This function updates the learning the object with the selected tags
   *
   * @param learningObjectCuid  the learningObjectCuid
   * @param tags  array of ids of tag objects
   */
  async updateObjectTags(learningObjectCuid: string, tags: string[]): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.http
        .put(TAGS_ROUTES.UPDATE_TAG(learningObjectCuid),
          { tags },
          {
            headers: this.headers,
            withCredentials: true,
            responseType: 'text',
          }
        )
        .pipe(
          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => resolve(res),
          (err) => reject(err),
        );
    });
  }


  /**
   * Returns all the valid types for a tag
   *
   * @returns A list of type tags for the selection
   */
  async getTypes(): Promise<{[key: string]: boolean}[]> {
    return await new Promise((resolve, reject) => {
      this.http
        .get<Tag[]>(TAGS_ROUTES.GET_ALL_TAG_TYPES())
        .pipe(

          catchError(this.handleError)
        )
        .toPromise()
        .then(
          (res: any) => {
            resolve(res.types);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  /** Used for Browse */
  public async getTagTypes(): Promise<{
    types: { name: string; value: TagType }[];
  }> {
    return await this.http
      .get<{
        types: { name: string; value: TagType }[];
      }>(TAGS_ROUTES.GET_ALL_TAG_TYPES())
      .pipe(catchError(this.handleError))
      .toPromise();
  }

  public async getTagIdByName(tagName: string): Promise<string> {
     const url =  TAGS_ROUTES.GET_ALL_TAGS({ text: tagName });
        const res = await fetch(url, { method: 'GET' });
        const data: GetTagByNameResponse = await res.json();
        const tag =  data.tags?.[0]?._id ?? null;
        return tag;
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
