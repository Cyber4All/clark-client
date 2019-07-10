import { Router } from '@angular/router';
import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from './core/auth.service';
import { CartV2Service } from './core/cartv2.service';
import { ModalService, ModalListElement } from './shared/modals';
import { trigger, transition, style, animate } from '@angular/animations';
import { Body } from '@angular/http/src/body';

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

  constructor(private authService: AuthService, private cartService: CartV2Service, private router: Router) {
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
  }

  ngOnInit(): void {
    setInterval(async () => {
      try {
        await this.authService.checkClientVersion();
      } catch (e) {
        this.errorMessage = e.error.split('.');
        this.isOldVersion = true;
      }
    }, 600000); // 10 minute interval
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
}
