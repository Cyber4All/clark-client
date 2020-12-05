import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { take, catchError } from 'rxjs/operators';

@Injectable()
export class TopicListLoader {
  constructor(private readonly http: HttpClient) {}

  async load(): Promise<string[]> {
    const topicListUrl = `/topics`;

    const response = await this.http
      .get(topicListUrl)
      .pipe(
        take(1),
        catchError((e) => of(e)),
      )
      .toPromise();

    return response.topics;
  }
}
