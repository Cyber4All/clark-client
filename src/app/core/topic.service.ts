import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  constructor(private http: HttpClient) { }


  /**
   * Get ratings for a learning object
   *
   * @param {string} CUID
   * @param {string} version
   * @returns {Promise<any>}
   */
  getLearningObjectTopics(): Promise<any> {
    return this.http
      .get('http://localhost:5001/topics', { withCredentials: true }).toPromise();
  }

  assignNewTopics(body: any): Promise<any> {
    return this.http
      .post('http://localhost:5001/topics/assign/update', body, { withCredentials: true }).toPromise();
  }

}


