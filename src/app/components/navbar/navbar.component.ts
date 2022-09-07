import {
  Component,
  OnInit,
  HostListener
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationStart,
  NavigationEnd
} from '@angular/router';

import { AuthService } from '../../core/auth.service';
import * as md5 from 'md5';
import { NavbarService } from '../../core/navbar.service';

// imports for animation
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { UserService } from 'app/core/user.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'clark-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    trigger('simpleFadeAnimation', [
      state('in', style({opacity: 1})),
      // fade in
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-80px)' }),
        animate(200, style({ opacity: 1, transform: 'translateY(0px)' }))
      ]),
      // fade out
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0px)' }),
        animate('250ms ease', style({ opacity: 0, transform: 'translateY(-80px)' }))
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit {
  responsiveThreshold = 825;
  windowWidth: number;

  searchFocusSubject: Subject<any> = new Subject();
  searchBlurSubject: Subject<any> = new Subject();

  // flags
  isOnion = false;
  showNav = true;
  loggedin = this.authService.user ? true : false;
  menuOpen = false; // flag for whether or not the mobile menu is out
  searchDown = false; // flag for whether or not the search is down
  searchOverflow = false; // flag for whether or not the search is down

  userDown = false; // flag for whether or not the user context menu is open

  contributorDown = false; // flag for whether or not the contributor context menu is open

  url: string;

  notifications: [];
  libraryNotificationCount = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = event.target.innerWidth;
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    event.preventDefault();
    if (event.code === 'Escape') {
      // escape key pressed, close the search bar for Sean
      this.hideSearch();
    }
  }

  constructor(
    private router: Router,
    public authService: AuthService,
    public nav: NavbarService,
    private userService: UserService,
  ) {
    this.windowWidth = window.innerWidth;

      this.router.events.subscribe(e => {
        if (e instanceof NavigationEnd) {
          // if we're in onion, auth, or admin, toggle the navbar off
          this.showNav = e.url.match(/\/*onion[\/*[0-z]*]*/)
            || e.url.match(/\/*auth[\/*[0-z]*]*/)
            || e.url.match(/\/*admin[\/*[0-z]*]*/) ? false : true;

          if (e.url.match(/\/*onion[\/*[0-z]*]*/)) {
            this.menuOpen = this.searchDown = false;
          };
          this.url = e.url;
        };
        window.scrollTo(0, 0);
      });
  };

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(val => {
      this.loggedin = val ? true : false;
      this.getNotifications();
    });
    this.showNav = this.nav.visible;
    window.scrollTo(0, 0);
  }

  async getNotifications() {
    await this.userService.getNotificationCount(this.authService.username);
  }

  showSearch() {
    this.searchDown = true;

    // wait for animation and then focus input
    setTimeout(() => {
      this.searchOverflow = true;
      if (this.isMobile) {
        this.searchFocusSubject.next();
      }
    }, 450);
  }

  hideSearch() {
    this.searchBlurSubject.next();
    this.searchDown = this.searchOverflow = false;
  }

  logout() {
    this.authService.logout();
  }

  /**
   * Click events on the user section of the topbar, displays context menu
   *
   * @param {boolean} [value] true if open, false otherwise
   */
  userDropdown(value?: boolean): void {
    this.userDown = value;
  }

  /**
   * Click events on the contributor section of the topbar, displays context menu
   *
   * @param {boolean} [value] true if open, false otherwise
   */
  contributorDropdown(value?: boolean): void {
    this.contributorDown = value;
  }

  gravatarImage(size): string {
    // r=pg checks the rating of the Gravatar image
    return (
      'https://www.gravatar.com/avatar/' +
      md5(this.authService.user.email) +
      '?s=' +
      size +
      '?r=pg&d=identicon'
    );
  }

  get isMobile(): boolean {
    return this.windowWidth <= this.responsiveThreshold;
  }

  goToContent(value: string) {
    document.getElementById(value).focus();
  }
}
