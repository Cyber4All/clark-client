import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UtilityService } from 'app/core/utility-module/utility.service';
import { Observable } from 'rxjs';
import { Blog } from './types/blog';

@Component({
  selector: 'clark-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss'],
  animations: [
    trigger('blogView', [
      transition(':enter', [
        style({
          position: 'relative',
          left: '-100%'
        }),
        animate('500ms ease-out', style({
          position: 'relative',
          left: '0%'
        })
        )
      ]),
    ])
  ]
})
export class BlogsComponent implements OnInit {
  blogObservable: Observable<Blog[]>; // used for the template
  blog: Blog; // used to emit the blog
  dismissText = 'You will not see this pop up again until the next blog post.';
  dismissOnceText = 'You will not see this pop up again until you reload the page.';

  checkbox = false;
  view = 0;
  @Output() showBlogsBanner: EventEmitter<boolean> = new EventEmitter();
  @Output() neverShowBanner: EventEmitter<{val: boolean, recentBlog?: Blog}> = new EventEmitter();

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.blogObservable = this.utilityService.getAllBlogs();
    this.utilityService.getAllBlogs().subscribe(
      (blogArray: Blog[]) => {
        this.blog = blogArray[0];
      }
    );
  }

  /**
   * Emit logic when the dismiss button is clicked
   */
  dismiss() {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit({val: true, recentBlog: this.blog});
    }

  /**
   * Emit logic when the dismiss once button is clicked
   */
  dismissOnce() {
      this.showBlogsBanner.emit(false);
      this.neverShowBanner.emit({val: false});
    }

  /**
   * Toggles the checkbox
   */
  toggleCheckbox() {
    this.checkbox = !this.checkbox;
  }

  /**
   * Disables the animations if the view width is smaller than laptop width
   *
   * @returns boolean determining if animations should be disabled
   */
  disableAnimations() {
    const laptopWidth = 1024; // threshold to disable animations
    return window.outerWidth < laptopWidth;
  }
}
