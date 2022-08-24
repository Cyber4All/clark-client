import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Blog } from 'app/components/blogs/types/blog';
import { BlogsComponentService } from 'app/core/blogs-component.service';

@Component({
  selector: 'clark-new-home',
  templateUrl: './new-home.component.html',
  styleUrls: ['./new-home.component.scss'],
  animations: [
    trigger('blog', [
      transition(':enter', [
        style({
          transform: 'translateY(-100%)'
        }),
        animate('300ms 1200ms ease-out', style({
          transform: 'translateY(0%)'
        }))
      ]),
      transition(':leave', [
        style({ zIndex: 3 }),
        animate('300ms ease-out', style({ transform: 'translate3d(0, -100%, 1px)', zIndex: 3 }))
      ])
    ])
  ]
})
export class NewHomeComponent implements OnInit {

  constructor(private blogsComponentService: BlogsComponentService) { }

  ngOnInit(): void {
  }

  /**
   * Catches the output emitted by clark-blogs to dismiss the banner
   *
   * @param val The value of showBanner
   */
   showBlogsBanner(val: boolean) {
    this.blogsComponentService.setShowBanner(val);
  }

  /**
   * Catches the checkbox output emitted by clark-blogs to never see the banner again
   *
   * @param args: val - the value of the checkbox
   *              recentBlog - the blog that was dismissed
   */
  neverShowBanner(args: {val: boolean, recentBlog?: Blog}) {
    this.blogsComponentService.setNeverShowBanner(args);
  }

  /**
   * Determines if the blogs banner is to be shown
   *
   * @returns a value determining if the blogs banner is shown
   */
  displayBlogsBanner() {
    return this.blogsComponentService.getShowBanner() && !this.blogsComponentService.getNeverShowBanner();
  }

}
