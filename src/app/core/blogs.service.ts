import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Blog } from 'app/components/blogs/types/blog';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogsService {

  constructor(private http: HttpClient) { }

  /**
   * Gets the most recent blog from the database
   *
   * @returns An observable containing an array of a single blog
   */
  getMostRecentBlog(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${environment.apiURL}/blogs?recent=true`);
  }

  /**
   * Gets all blogs from the database
   *
   * @returns An observable containing an array of blogs
   */
  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${environment.apiURL}/blogs`);
  }
}
