import { Component, OnInit } from '@angular/core';
import { BlogsService } from 'app/core/blogs.service';

@Component({
  selector: 'clark-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {

  constructor(private blogsService: BlogsService) { }

  ngOnInit(): void {
    this.blogsService.getMostRecentBlog().subscribe({
      next(x) {
        console.log(x);
      },
      error(e) {
        console.error(e);
      },
      complete() {
        console.log('done');
      }
    });
  }

}
