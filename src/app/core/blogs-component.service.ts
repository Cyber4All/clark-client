import { Injectable } from '@angular/core';
import { Blog } from 'app/components/blogs/types/blog';
import { BlogsService } from './blogs.service';

@Injectable({
  providedIn: 'root'
})
export class BlogsComponentService {
  neverShowBanner = false; // true if the user doesn't want to see the blog again
  showBanner = true; // true if blog is displayed

  recentBlog: Blog; // holds the latest blogpost

  constructor(private blogsService: BlogsService) {
    this.blogsService.getMostRecentBlog().subscribe(
      blogArray => {
        this.recentBlog = blogArray[0];
      }
    );
   }

  /**
   * Returns whether or not the banner is currently displayed
   *
   * @returns the showBanner boolean
   */
  getShowBanner(): boolean {
    return this.showBanner;
  }

  /**
   * Updates neverShowBanner and returns whether or not the user wants to see the banner again
   *
   * @returns the neverShowBanner boolean
   */
  getNeverShowBanner(): boolean {
    this.updateNeverShowBanner();
    return this.neverShowBanner;
  }

  /**
   * If a new blog has been posted, remove all relevant localStorage items
   * If the user has previously asked to not see the banner again, neverShowBanner will be true
   */
  private updateNeverShowBanner() {
    const currentBlogId = localStorage.getItem('bannerBlogId');
    if(this.recentBlog && (currentBlogId !== this.recentBlog._id)) {
      localStorage.removeItem('neverShowBanner');
      localStorage.removeItem('bannerBlogId');
    }
    const status = localStorage.getItem('neverShowBanner');
    this.neverShowBanner = status === 'true';
  }

  /**
   * Used to dismiss the banner
   *
   * @param val The value of the showBanner to be set
   */
  setShowBanner(val: boolean) {
    this.showBanner = val;
  }

  /**
   * Used if the user asks to never see the banner again
   *
   * @param args: val - if the user wants to see the banner again
   *              recentBlog - if the user doesn't want to see the banner again, the blog that was dismissed
   */
  setNeverShowBanner(args: {val: boolean, recentBlog?: Blog}) {
    localStorage.setItem('neverShowBanner', args.val.toString());
    localStorage.setItem('bannerBlogId', args.recentBlog._id);
    this.neverShowBanner = args.val;
  }
}
