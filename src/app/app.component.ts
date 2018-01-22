import { LearningObjectService } from './learning-object.service';
import { Component } from '@angular/core';
import { ModalService, Position, ModalListElement } from 'clark-modal';
import { RouterModule, Router } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // FIXME: Convert 'class' to 'type' for consistancy
  activeContentSwitcher = 'search';
  name = 'Sean Donnelly'

  constructor(public service: LearningObjectService, public modalCtrl: ModalService, public router: Router) {
  }

  logout() {
    throw new Error('logout() not implemented!');
  }

  userprofile() {
    //throw new Error('userprofile() not implemented!');
    this.router.navigate(['/userprofile']);
  }

  preferences() {
    throw new Error('preferences() not implemented!');
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
        new ModalListElement('<i class="fas fa-user-circle fa-fw"></i></i>View profile', 'userprofile'),
        new ModalListElement('</i>Change preferences', 'preferences'),
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
