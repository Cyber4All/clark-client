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

  getMostRecentBlog(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${environment.apiURL}/blogs?recent=true`);
  }

  getAllBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${environment.apiURL}/blogs`);
  }
}
