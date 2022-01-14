import {
  Component,
  OnInit,
  AfterContentChecked,
  HostListener,
  OnDestroy
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  NavigationStart
} from '@angular/router';

import { AuthService } from '../../core/auth.service';
import * as md5 from 'md5';
import { Subscription ,  Subject } from 'rxjs';
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
export class NavbarComponent implements OnInit, AfterContentChecked, OnDestroy {
  responsiveThreshold = 750;
  windowWidth: number;
  version: any;
  subs: Subscription[] = [];

  searchFocusSubject: Subject<any> = new Subject();
  searchBlurSubject: Subject<any> = new Subject();

  // flags
  hideNavbar = false;
  isOnion = false;
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
    private route: ActivatedRoute,
    public authService: AuthService,
    public nav: NavbarService,
    private userService: UserService,
  ) {
    this.windowWidth = window.innerWidth;

    this.subs.push(
      this.router.events.subscribe(e => {
        if (e instanceof NavigationStart) {
          // if we're in the onion client, make sure the navigation switcher reflects it
          if (e.url.match(/\/*onion[\/*[0-z]*]*/)) {
            this.isOnion = true;
          } else {
            this.isOnion = false;
          }

          this.menuOpen = this.searchDown = false;
        } else if (e instanceof NavigationEnd) {
          // scroll to top of page when any router event is fired
          window.scrollTo(0, 0);

          // hide navbar if it should be hidden
          const root: ActivatedRoute = this.route.root;
          this.hideNavbar = root.children[0].snapshot.data.hideTopbar;

          this.url = e.url;
        }
      })
    );

    // pull the version number out of package.json and extract the prefix (alpha, beta, release-candidate, etc)
    const { version: appVersion } = require('../../../../package.json');
    const versionRegex = /[0-9]+\-([A-z]+(?=\.[0-9]+))/;
    const matched = versionRegex.exec(appVersion);

    if (matched && matched.length >= 1) {
      this.version = matched[1];
    }
  }

  ngOnInit() {
    this.subs.push(
      this.authService.isLoggedIn.subscribe(val => {
        this.loggedin = val ? true : false;
        this.getNotifications();
      })
    );
  }

  ngAfterContentChecked(): void {
    // FIXME there has to be a better way to do this
    if (window.location.pathname.indexOf('auth') >= 0) {
      this.hideNavbar = true;
    } else {
      this.hideNavbar = false;
    }
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
   * @param {boolean} [value] true if open, false otherwise
   */
  userDropdown(value?: boolean): void {
    this.userDown = value;
  }

  /**
   * Click events on the contributor section of the topbar, displays context menu
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

  ngOnDestroy() {
    // close all subscriptions
    for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }

    this.subs = [];
  }
}
