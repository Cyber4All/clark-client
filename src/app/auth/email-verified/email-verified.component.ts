import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-email-verified',
  styles: [
    `.message--in-progress {
      margin-bottom: 20px;
    }
    .wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
  }
    `
  ],
  templateUrl: './email-verified.component.html'
})
export class EmailVerifiedComponent implements OnInit {
  isLoading = true;
  hasValidToken;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.validateAndRefreshToken()
      .then(async () => {
        // Token is good, refresh it and go home
        await this.auth.refreshToken();
        this.hasValidToken = true;
        this.isLoading = false;
      })
      .catch(e => {
        this.isLoading = false;
        this.hasValidToken = false;
        // Token is bad, they must sign in
      });
  }
}
