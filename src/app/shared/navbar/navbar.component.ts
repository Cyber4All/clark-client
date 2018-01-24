import { NgModule } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { ModalService, Position, ModalListElement } from 'clark-modal';
import { RouterModule, Router, ActivatedRoute, UrlSegment, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ModalModule } from 'clark-modal';
import { NotificationModule } from 'clark-notification';
import { CheckBoxModule } from 'clark-checkbox';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  // FIXME: Convert 'class' to 'type' for consistancy
  activeContentSwitcher = 'search';
  name = ''
  hideNavbar: boolean = false;

  constructor(private modalCtrl: ModalService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      let root: ActivatedRoute = this.route.root;
      this.hideNavbar = root.children[0].snapshot.data.hideNavbar;
    });
  }

  logout() {
    throw new Error('logout() not implemented!');
  }

  userprofile() {
    this.router.navigate(['/userprofile']);
  }

  preferences() {
    this.router.navigate(['/userpreferences']);
  }

  /**
   * Click events on the user section of the topbar, displays modal
   * @param event
   */
  userDropdown(event): void {
    console.log(event);
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

  /**
     * Manages click events for the button for switching between contributing and searching (onion and cube)
     * @param event
     */
  contentSwitchClick(event) {
    const el = event.target;
    const h = document.getElementsByClassName('content-switch')[0];
    if (el.classList.contains('contribute') && this.activeContentSwitcher !== 'contribute') {
      h.classList.remove('right');
      h.classList.add('left');
      this.activeContentSwitcher = 'contribute';

      setTimeout(() => {
        window.location.href = 'http://onion.clark.center';
      }, 250);
    } else if (el.classList.contains('search') && this.activeContentSwitcher !== 'search') {
      h.classList.remove('left');
      h.classList.add('right');
      this.activeContentSwitcher = 'search';
    }
  }



}
