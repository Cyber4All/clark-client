import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { of } from 'rxjs';
import { take, catchError } from 'rxjs/operators';

@Injectable()
export class TopicListLoader {
  constructor(private readonly http: HttpClient) {}

  async load(): Promise<string[]> {


    const response = await this.http
      .get(environment.topicListUrl)
      .pipe(
        take(1),
        catchError((e) => of(e)),
      )
      .toPromise();

    return response.topics;
  }
}
