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

  getShowBanner(): boolean {
    return this.showBanner;
  }

  getNeverShowBanner(): boolean {
    this.updateNeverShowBanner();
    return this.neverShowBanner;
  }

  private updateNeverShowBanner() {
    const currentBlogId = localStorage.getItem('bannerBlogId');
    if(currentBlogId !== this.recentBlog._id) {
      localStorage.removeItem('neverShowBanner');
      localStorage.removeItem('bannerBlogId');
    }
    const status = localStorage.getItem('neverShowBanner');
    this.neverShowBanner = status === 'true';
  }

  setShowBanner(val: boolean) {
    this.showBanner = val;
  }

  setNeverShowBanner(args: {val: boolean, recentBlog?: Blog}) {
    localStorage.setItem('neverShowBanner', args.val.toString());
    localStorage.setItem('bannerBlogId', args.recentBlog._id);
    this.neverShowBanner = args.val;
  }
}
