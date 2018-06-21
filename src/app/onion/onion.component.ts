import { ModalService, ModalListElement, Position } from '../shared/modals';
import { NotificationService } from '../shared/notifications';
import { Component } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { AuthService } from '../core/auth.service';

/**
 * The entry component for the application. This component contains a router outlet for routing to other components.
 * Authentication status and logout functionality are handled here.
 *
 * @author Sean Donnelly
 */
@Component({
  selector: 'onion-root',
  templateUrl: './onion.component.html',
  styleUrls: ['./onion.component.scss']
})
export class OnionComponent {
  activeRoute: string;
  activeContentSwitcher = 'contribute';

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public modalService: ModalService,
    public noteService: NotificationService,
  ) { }

  /**
   * Click events on the user section of the topbar, displays modal
   * @param event
   */
  userDropdown(event): void {
    this.modalService.makeContextMenu(
      'UserContextMenu',
      'dropdown',
      [
        new ModalListElement('<i class="far fa-sign-out"></i>Sign out', 'logout')
      ],
      true,
      null,
      new Position(
        this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        this.modalService.offset(event.currentTarget).top + 50))
      .subscribe(val => {
        if (val === 'logout') {
          this.logout();
        }
      });
  }

  /**
   * Logs out user, resets stored user displayname, closes any open modals, and redirects to login page
   *
   * @memberof AppComponent
   */
  logout(): void {
    this.authService.logout();
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
    } else if (el.classList.contains('search') && this.activeContentSwitcher !== 'search') {
      h.classList.remove('left');
      h.classList.add('right');
      this.activeContentSwitcher = 'search';
    }
  }
  /**
   * Closes context menus and dropdowns on scroll
   * @param event
   */
  scroll(event) {
    this.modalService.close('context');
  }
}
