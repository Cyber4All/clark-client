import { Component } from '@angular/core';
import { AuthService } from './core/auth.service';
import { CartV2Service } from './core/cartv2.service';

@Component({
  selector: 'clark-root',
  templateUrl: './clark.component.html',
  styleUrls: ['./clark.component.scss']
})
export class ClarkComponent {

  constructor(private authService: AuthService, private cartService: CartV2Service) {
    this.authService.isLoggedIn.subscribe(val => {
      if (val) {
        this.cartService.updateUser();
        this.cartService.getCart();
      }
    });
  }
}
