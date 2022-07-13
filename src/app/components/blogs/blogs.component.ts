import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BlogsService } from 'app/core/blogs.service';
import { Observable } from 'rxjs';
import { Blog } from './types/blog';

@Component({
  selector: 'clark-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {
  blogObservable: Observable<Blog[]>; // used for the template
  blog: Blog; // used to emit the blog

  checkbox = false;
  @Output() showBlogsBanner: EventEmitter<boolean> = new EventEmitter();
  @Output() neverShowBanner: EventEmitter<{val: boolean, recentBlog?: Blog}> = new EventEmitter();

  constructor(private blogsService: BlogsService) { }

  ngOnInit(): void {
    this.blogObservable = this.blogsService.getMostRecentBlog();
    this.blogsService.getMostRecentBlog().subscribe(
      (blogArray: Blog[]) => {
        this.blog = blogArray[0];
      }
    );
  }

  dismiss() {
    if(this.checkbox) {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit({val: true, recentBlog: this.blog});
    } else {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit({val: false});
    }
  }

  toggleCheckbox() {
    this.checkbox = !this.checkbox;
  }
}
