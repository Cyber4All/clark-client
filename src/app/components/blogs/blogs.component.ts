import { Component, OnInit } from '@angular/core';
import { BlogsService } from 'app/core/blogs.service';
import { Observable } from 'rxjs';
import { Blog } from './types/blog';

@Component({
  selector: 'clark-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {
  blogObservable: Observable<Blog[]>;
  constructor(private blogsService: BlogsService) { }

  ngOnInit(): void {
    this.blogObservable = this.blogsService.getMostRecentBlog();
  }

}
