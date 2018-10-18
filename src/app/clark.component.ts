import { Router } from '@angular/router';
import { Component, OnInit} from '@angular/core';
import { AuthService } from './core/auth.service';
import { CartV2Service } from './core/cartv2.service';
import { ModalService, ModalListElement } from './shared/modals';
import { trigger, transition, style, animate } from '@angular/animations';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PopupComponent } from './shared/popups/popup.component';

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
  connectedToSocket: boolean;
  isSupportedBrowser: boolean;
  cookiesAgreement: boolean;

  constructor(
    private authService: AuthService,
    private cartService: CartV2Service,
    private modal: ModalService,
    private router: Router,
    private popup: PopupComponent
  ) {
    this.isSupportedBrowser = !(/msie\s|trident\/|edge\//i.test(window.navigator.userAgent));
    !this.isSupportedBrowser ? this.router.navigate(['/unsupported']) :
      this.connectedToSocket = false;
      this.authService.isLoggedIn.subscribe(val => {
        if (val) {
          this.cartService.updateUser();
          this.cartService.getCart();

          this.connectedToSocket = this.attemptSocketConnection();

        } else if (this.connectedToSocket) {
          this.authService.destroySocket();
        }
      });

      if (localStorage.getItem('cookieAgreement')) {
        this.cookiesAgreement = true;
      }
  }

  ngOnInit(): void {
    setInterval(async () => {
      try {
        await this.authService.checkClientVersion();
      } catch (e) {
        this.popup = new PopupComponent();

        // const shouldRefresh = await this.modal.makeDialogMenu(
        //   'updateRequired',
        //   'A New Version of CLARK is Available!',
        //   'Please refresh your browser window to see our latest changes!',
        //   false,
        //   'title-good',
        //   'center',
        //   [new ModalListElement('Refresh page', 'refresh', 'green')]
        // )
        // .toPromise();
        // if (shouldRefresh === 'refresh') {
        //   window.location.reload();
        // }
      }
    }, 10000);
  }

  /**
   * Checks if the user is unverified and if they are establishes connection to gateway via socket
   */
  attemptSocketConnection(): boolean {
    if (!this.authService.user.emailVerified) {
      this.authService.establishSocket().subscribe(res => {
        // events
        if (res === 'VERIFIED_EMAIL') {
          this.modal.makeDialogMenu(
            'emailVerified',
            'Email Verified!',
            'Thank you for verifying your email! Now you can do awesome things like publish learning objects and upload materials!',
            true,
            'title-good',
            'center',
            [new ModalListElement('Got it!', 'done', 'green')]
          );
        }
      });

      return true;
    }

    return false;
  }

  /**
   * Stores cookie agreement value in localStorage and hides banner
   * @param val the value to store in cookieAgreement (always true at this point)
   */
  setCookieAgreement(val: boolean) {
    localStorage.setItem('cookieAgreement', val + '');
    this.cookiesAgreement = val;
  }
}
