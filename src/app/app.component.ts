import { LearningObjectService } from './learning-object.service';
import { Component } from '@angular/core';
import { ModalService } from './shared/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // FIXME: Convert 'class' to 'type' for consistancy
  activeContentSwitcher = 'search';
  name = 'Sean Donnelly'

  constructor(public service: LearningObjectService, public modalCtrl: ModalService) {
  }

  logout() {
    throw new Error('logout() not implemented!');
  }
  /**
   * Click events on the user section of the topbar, displays modal
   * @param event
   */
  userDropdown(event): void {
    // FIXME: Get modal to display when clicked
    this.modalCtrl.contextMenuContent = {
      name: 'UserContextMenu',
      classes: 'dropdown',
      pos: {
        x: this.modalCtrl.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        y: this.modalCtrl.offset(event.currentTarget).top + 50 },
        list: [{ text: '<i class="far fa-sign-out"></i>Sign out', func: 'logout' }]
      };
    this.modalCtrl.listen('UserContextMenu').subscribe(val => {
      if (val === 'logout') {
        this.logout();
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
