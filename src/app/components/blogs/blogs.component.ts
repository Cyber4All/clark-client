import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BlogsService } from 'app/core/blogs.service';
import { Observable } from 'rxjs';
import { Blog } from './types/blog';

@Component({
  selector: 'clark-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })
        )
      ])
    ])
  ]
})
export class BlogsComponent implements OnInit {
  blogObservable: Observable<Blog[]>; // used for the template
  blog: Blog; // used to emit the blog

  checkbox = false;
  view = 0;
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

  /**
   * Emit logic when the dismiss button is clicked
   * If the checkbox is checked, then return true and emit the blog
   */
  dismiss() {
    if(this.checkbox) {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit({val: true, recentBlog: this.blog});
    } else {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit({val: false});
    }
  }

  /**
   * Toggles the checkbox
   */
  toggleCheckbox() {
    this.checkbox = !this.checkbox;
  }
}
