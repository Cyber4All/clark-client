import { Router , NavigationEnd, ActivatedRoute} from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from './core/auth.service';
import { CartV2Service } from './core/cartv2.service';
import { UriRetrieverService } from './core/uri-retriever.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/filter';
import { HistoryService } from './core/history.service';
import { filter } from 'rxjs/operators';
import { LearningObject } from '../entity/learning-object/learning-object';
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
  cookiesAgreement: boolean;
  isOldVersion = false;
  errorMessage: string;
  hidingOutlines = true;
  learningObject: LearningObject;

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
    private cartService: CartV2Service,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private _: HistoryService,
    private uriRetrieverService: UriRetrieverService
    ) {
    this.isSupportedBrowser = !(/msie\s|trident\/|edge\//i.test(window.navigator.userAgent));
    !this.isSupportedBrowser ? this.router.navigate(['/unsupported']) :
      this.authService.isLoggedIn.subscribe(val => {
        if (val) {
          this.cartService.updateUser();
          this.cartService.getCart();
        }
      });

      if (localStorage.getItem('cookieAgreement')) {
        this.cookiesAgreement = true;
      }

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd && event.id > 1)
      ).subscribe(() => {
        const content: HTMLElement = document.querySelector('#pageContent');

        if (content) {
          content.focus();
        }
      });
  }

  ngOnInit(): void {
    console.log('Subscribe')
    this.uriRetrieverService.getLearningObject({author: 'evogel4', name: 'Test ReadMe Replace'}).subscribe(object => {
      console.log('Is it me youre looking for')
      if (object) {
        console.log('Hello?', object);
      }
    });

    setInterval(async () => {
      try {
        await this.authService.checkClientVersion();
      } catch (e) {
        this.errorMessage = e.error.split('.');
        this.isOldVersion = true;
      }
    }, 600000); // 10 minute interval

    this.setPageTitle();
  }

  reloadPage() {
    location.reload();
  }

  /**
   * Stores cookie agreement value in localStorage and hides banner
   * @param val the value to store in cookieAgreement (always true at this point)
   */
  setCookieAgreement(val: boolean) {
    localStorage.setItem('cookieAgreement', val + '');
    this.cookiesAgreement = val;
  }

  /* set the document title to show location in
  browser tabs and notify AT's of current location */
  setPageTitle() {
    this.router.events
    .filter(event => event instanceof NavigationEnd)
    .subscribe(() => {
      let data;
      const activeRoutes: ActivatedRoute[] = this.activatedRoute.children;

      activeRoutes.forEach((route: ActivatedRoute) => {
        let activeRoute: ActivatedRoute = route;
        while (activeRoute.firstChild) {
          activeRoute = activeRoute.firstChild;
        }
        if (activeRoute.snapshot.params.username) {
          if (activeRoute.snapshot.params.learningObjectName) {
            data = activeRoute.snapshot.params.learningObjectName;
          } else {
            data = activeRoute.snapshot.params.username;
          }
        } else {
          data = activeRoute.snapshot.data.title;
        }
        if (data !== undefined) {
          this.titleService.setTitle(data + ' | CLARK');
        }
      });
    });
  }
}
