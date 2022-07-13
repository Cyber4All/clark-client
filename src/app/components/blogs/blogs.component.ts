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
  blogObservable: Observable<Blog[]>;

  checkbox = false;
  @Output() showBlogsBanner: EventEmitter<boolean> = new EventEmitter();
  @Output() neverShowBanner: EventEmitter<boolean> = new EventEmitter();

  constructor(private blogsService: BlogsService) { }

  ngOnInit(): void {
    this.blogObservable = this.blogsService.getMostRecentBlog();
  }

  dismiss() {
    if(this.checkbox) {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit(true);
    } else {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit(false);
    }
  }

  toggleCheckbox() {
    this.checkbox = !this.checkbox;
  }
}
