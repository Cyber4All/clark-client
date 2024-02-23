import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  HostListener,
  ViewContainerRef,
} from '@angular/core';
import { AuthService } from './core/auth-module/auth.service';
import { LibraryService } from './core/library-module/library.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Title } from '@angular/platform-browser';

import { HistoryService } from './core/history.service';
import { filter } from 'rxjs/operators';
import { LearningObject } from '../entity/learning-object/learning-object';
import { Downtime, MessagesService } from './core/utility-module/messages.service';
import { environment } from '@env/environment';
import { ToastrOvenService } from './shared/modules/toaster/notification.service';
import { CookieAgreementService } from './core/auth-module/cookie-agreement.service';
import { SubscriptionAgreementService } from './core/utility-module/subscription-agreement.service';
import { CookieService } from 'ngx-cookie-service';
import { UtilityService } from './core/utility-module/utility.service';

@Component({
  selector: 'clark-root',
  templateUrl: './clark.component.html',
  styleUrls: ['./clark.component.scss'],
  animations: [
    trigger('banner', [
      transition(':enter', [
        style({
          bottom: '-100px',
          opacity: 0
        }),
        animate(
          '300ms 1500ms ease-out',
          style({
            bottom: '0',
            opacity: 1
          })
        )
      ]),
      transition(':leave', [
        style({
          bottom: '0',
          opacity: 1
        }),
        animate(
          '300ms ease-out',
          style({
            bottom: '-100px',
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class ClarkComponent implements OnInit {
  isSupportedBrowser: boolean;
  isOldVersion = false;
  errorMessage: string;
  hidingOutlines = true;
  learningObject: LearningObject;

  downtime: Downtime = new Downtime(false, '');

  @HostListener('window:click', ['$event'])
  @HostListener('window:keyup', ['$event'])
  handleOutlines(event) {
    if (event.code === 'Tab' && this.hidingOutlines) {
      this.hidingOutlines = false;
      document.body.classList.remove('hide-outlines');
    } else if (event instanceof MouseEvent && !this.hidingOutlines) {
      this.hidingOutlines = true;
      document.body.classList.add('hide-outlines');
    }
  }

  constructor(
    private authService: AuthService,
    private libraryService: LibraryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private route: ActivatedRoute,
    private _: HistoryService,
    private messages: MessagesService,
    private toaster: ToastrOvenService,
    private view: ViewContainerRef,
    private cookieAgreement: CookieAgreementService,
    private subscriptionAgreement: SubscriptionAgreementService,
    private cookies: CookieService,
    private utilityService: UtilityService
  ) {
    this.isSupportedBrowser = !(/msie\s|trident\/|edge\//i.test(window.navigator.userAgent));
    !this.isSupportedBrowser ? this.router.navigate(['/unsupported']) :
      this.authService.isLoggedIn.subscribe(val => {
        if (val) {
          this.libraryService.updateUser();
          this.libraryService.getLibrary();
        }
      });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && event.id > 1)
    ).subscribe(() => {
      const content: HTMLElement = document.querySelector('#pageContent');

      if (content) {
        content.focus();
      }
    });

    this.toaster.setPosition({ x: 'left', y: 'bottom' });
    this.toaster.init(this.view);
    this.route.queryParams.subscribe(() => {
      if (this.route.snapshot.queryParams.err) {
        this.toaster.error('SSO Error', decodeURIComponent(this.route.snapshot.queryParams.err));
      }
    });
  }

  ngOnInit(): void {
    if (environment.production) {
      this.messages.getDowntime().then(down => {
        this.downtime = down;
      });
      // Determine if the application is currently under maintenance
      setInterval(async () => {
        this.messages.getDowntime().then(down => {
          this.downtime = down;
        });
      }, 300000); // 5 min interval
      // check to see if the current version is behind the latest verison
      setInterval(async () => {
        try {
          await this.utilityService.checkClientVersion();
        } catch (e) {
          this.errorMessage = e.error.split('.');
          this.isOldVersion = true;
        }
      }, 600000); // 10 minute interval for setting the timeout <- Comment from orb deployment
    }

    this.setPageTitle();

    if (this.cookies.check('ssoToken')) {
      this.authService.setSsoSession(this.cookies.get('ssoToken'));
      const redirect = localStorage.getItem('ssoRedirect');
      this.router.navigateByUrl(redirect);
      localStorage.removeItem('ssoRedirect');
    } else if (localStorage.getItem('ssoRedirect')) {
      localStorage.removeItem('ssoRedirect');
    }

  }

  reloadPage() {
    location.reload();
  }

  /**
   * Function passes cookie agreement service val to create new agreement
   * Then updates banner visibilty flag
   *
   * @param val is value of clicking agreement event (will be true)
   */
  showCookieBanner(val: boolean) {
    this.cookieAgreement.setShowCookieBanner(val);
  }

  setCookieAgreement(val: boolean) {
    this.cookieAgreement.setCookieAgreement(val);
  }

  /**
   * Calls Service to do the work to check the agreement value and
   * return what said value is.
   */
  displayCookieBanner() {
    return this.cookieAgreement.getShowCookieBannerVal() && !this.cookieAgreement.getCookieAgreementVal();
  }

  // Function to update banner toggle
  showSubscriptionBanner(val: boolean) {
    this.subscriptionAgreement.setShowSubscriptionBanner(val);
  }

  // Checks subscription service to ensure the user has not already interacted with banner
  displayNewslettereBanner() {
    return this.subscriptionAgreement.getShowSubscriptionBannerVal();
  }

  /* set the document title to show location in
  browser tabs and notify AT's of current location */
  setPageTitle() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let data;
        const activeRoutes: ActivatedRoute[] = this.activatedRoute.children;

        activeRoutes.forEach((route: ActivatedRoute) => {
          let activeRoute: ActivatedRoute = route;
          while (activeRoute.firstChild) {
            activeRoute = activeRoute.firstChild;
          }
          // Determines if the route is to the users profile
          if (activeRoute.snapshot.params.username) {
            data = activeRoute.snapshot.params.username;
            // if not to users profile sets data to the title in the route
          } else {
            data = activeRoute.snapshot.data.title;
          }
          if (data !== undefined) {
            this.titleService.setTitle('CLARK | ' + data);
          }
        });
      });
  }
}
