import { Component } from '@angular/core';
import { AuthService } from './core/auth.service';
import { CartV2Service } from './core/cartv2.service';
import { ModalService, ModalListElement } from './shared/modals';

@Component({
  selector: 'clark-root',
  templateUrl: './clark.component.html',
  styleUrls: ['./clark.component.scss']
})
export class ClarkComponent {
  connectedToSocket: boolean;

  constructor(private authService: AuthService, private cartService: CartV2Service, private modal: ModalService) {
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
}
