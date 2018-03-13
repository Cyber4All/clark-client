import { CartV2Service } from '../../core/cartv2.service';
import { CartService } from '../../cube/core/services/cart.service';
import { Component, OnInit, AfterViewChecked, AfterContentChecked } from '@angular/core';
import { LearningObjectService } from '../../cube/learning-object.service';
import { ModalService, Position, ModalListElement } from '../modals';
import { RouterModule, Router, ActivatedRoute, UrlSegment, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { NotificationModule } from '../notifications';
import { CheckBoxModule } from 'clark-checkbox';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'clark-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterContentChecked  {

  // FIXME: Convert 'class' to 'type' for consistancy
  hideNavbar = false;
  loggedin = this.authService.user ? true : false;

  constructor(private modalCtrl: ModalService, private router: Router,
    private route: ActivatedRoute, private authService: AuthService, private cartService: CartV2Service) {
    }

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(val => {
      this.loggedin = (val) ? true : false;
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

  preferences() {
    this.router.navigate(['users', this.authService.user.username, 'preferences']);
  }

  /**
   * Click events on the user section of the topbar, displays modal
   * @param event
   */
  userDropdown(event): void {
    this.modalCtrl.makeContextMenu(
      'UserContextMenu',
      'dropdown',
      [
        new ModalListElement('<i class="fas fa-user-circle fa-fw"></i>View profile', 'userprofile'),
        new ModalListElement('<i class="fas fa-wrench fa-fw"></i>Change preferences', 'preferences'),
        new ModalListElement('<i class="far fa-sign-out"></i>Sign out', 'logout'),
      ],
      null,
      new Position(
        this.modalCtrl.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        this.modalCtrl.offset(event.currentTarget).top + 50))
      .subscribe(val => {
        if (val === 'logout') {
          this.logout();
        }
        if (val === 'userprofile') {
          this.userprofile();
        }
        if (val === 'preferences') {
          this.preferences();
        }
      });
  }





}
