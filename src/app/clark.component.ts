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

  constructor(private authService: AuthService, private cartService: CartV2Service, private modal: ModalService) {
    this.authService.isLoggedIn.subscribe(val => {
      if (val) {
        this.cartService.updateUser();
        this.cartService.getCart();

        if (!this.authService.user.emailVerified) {
          this.authService.establishSocket().subscribe(res => {
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
        }
      } else {
        this.authService.destroySocket();
      }
    });
  }
}
