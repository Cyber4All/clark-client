import {
  Component,
  OnInit,
  AfterContentChecked,
  HostListener
} from '@angular/core';
import { ModalService, Position, ModalListElement } from '../modals';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  NavigationStart
} from '@angular/router';

import { AuthService } from '../../core/auth.service';
import * as md5 from 'md5';

@Component({
  selector: 'clark-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterContentChecked {
  // FIXME: Convert 'class' to 'type' for consistancy
  hideNavbar = false;
  isOnion = false;
  menuOpen = false;
  searchDown = false;
  loggedin = this.authService.user ? true : false;
  responsiveThreshold = 750;
  windowWidth: number;
  version: any;
  searchFocused = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = event.target.innerWidth;
  }

  constructor(
    private modalCtrl: ModalService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.windowWidth = window.innerWidth;
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
      }
    });

    const {
      version: appVersion,
      name: appName,
      displayName: appDisplayName
    } = require('../../../../package.json');
    const versionRegex = /[0-9]+\-([A-z]+(?=\.[0-9]+))/;
    const matched = versionRegex.exec(appVersion);
    if (matched.length >= 1) {
      this.version = matched[1];
    }
  }

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(val => {
      this.loggedin = val ? true : false;
    });
  }

  ngAfterContentChecked(): void {
    if (window.location.pathname.indexOf('auth') >= 0) {
      this.hideNavbar = true;
    } else {
      this.hideNavbar = false;
    }
  }


  logout() {
    this.authService.logout().then(() => {
      window.location.reload();
    });
  }

  userprofile() {
    this.router.navigate(['users', this.authService.user.username]);
  }

  /**
   * Click events on the user section of the topbar, displays context menu
   * @param event
   */
  userDropdown(event): void {
    this.modalCtrl
      .makeContextMenu(
        'UserContextMenu',
        'dropdown',
        [
          new ModalListElement(
            '<i class="fas fa-user-circle fa-fw"></i>View profile',
            'userprofile'
          ),
          new ModalListElement(
            '<i class="far fa-sign-out"></i>Sign out',
            'logout'
          )
        ],
        true,
        null,
        new Position(
          this.modalCtrl.offset(event.currentTarget).left -
            (190 - event.currentTarget.offsetWidth),
          this.modalCtrl.offset(event.currentTarget).top + 50
        )
      )
      .subscribe(val => {
        if (val === 'logout') {
          this.logout();
        } else if (val === 'userprofile') {
          this.userprofile();
        }
      });
  }

  /**
   * Click events on the contributor section of the topbar, displays context menu
   * @param event
   */
  contributorDropdown(event): void {
    this.modalCtrl
      .makeContextMenu(
        'ContributorContextMenu',
        'dropdown',
        [
          new ModalListElement(
            'Your dashboard',
            'dashboard'
          ),
          new ModalListElement(
            'Create a Learning Object',
            'create'
          )
        ],
        true,
        null,
        new Position(
          this.modalCtrl.offset(event.currentTarget).left -
            (190 - event.currentTarget.offsetWidth),
          this.modalCtrl.offset(event.currentTarget).top + 40
        )
      )
      .subscribe(val => {
        if (val === 'create') {
          this.router.navigate(['onion', 'learning-object-builder']);
        }
        if (val === 'dashboard') {
          this.router.navigate(['onion', 'dashboard']);
        }
      });
  }

  /**
   * Takes a reference to the searchbar input to pass as a query to the browse component.
   * @param query
   */
  performSearch(searchbar) {
    searchbar.value = searchbar.value.trim();
    const query = searchbar.value;
    if (query.length) {
      // FIXME: Should use a relative route './browse'
      this.router.navigate(['/browse', { query }]);
    }

    this.searchDown = false;
  }

  gravatarImage(size): string {
    // r=pg checks the rating of the Gravatar image
    return (
      'https://www.gravatar.com/avatar/' +
      md5(this.authService.user.email) +
      '?s=' + size + '?r=pg&d=identicon'
    );
  }

  get isMobile(): boolean {
    return this.windowWidth <= this.responsiveThreshold;
  }
}
