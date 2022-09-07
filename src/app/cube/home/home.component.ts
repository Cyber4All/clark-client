import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, OnInit } from '@angular/core';
import { Blog } from 'app/components/blogs/types/blog';
import { BlogsComponentService } from 'app/core/blogs-component.service';
//remove after clark 5th birthday
import ConfettiGenerator from 'confetti-js';
//remove after clark 5th birthday

@Component({
  selector: 'clark-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
export class HomeComponent implements OnInit {

  //TO-DO:remove after clark5th birthday
  private resizeThreshold = 1024;
  //remove after clark5th birthday

  constructor(
    private blogsComponentService: BlogsComponentService
    ) { }

  ngOnInit(): void {
    //remove after clark 5th birthday
    this.renderConfetti(window.innerWidth >= this.resizeThreshold);
    //remove after clark 5th birthday
  }

  //remove after clark5th birthday
  renderConfetti(val: boolean): void {
    const DesktopConfettiSettings = {
      target: 'confetti-canvas',
      // max: '10000',
      clock: '15',
      height: '75'
    };

    const confetti = new ConfettiGenerator(DesktopConfettiSettings);
    confetti.render();
  }
  //remove after clark5th birthday

  @HostListener('window:resize', ['$event'])
  resizeWindow() {
    this.renderConfetti(window.innerWidth >= this.resizeThreshold);
  }
  //remove after clark5th birthday

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
