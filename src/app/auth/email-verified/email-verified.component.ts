import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-email-verified',
  styles: [
    `.message--in-progress {
      color: red;
    }`
  ],
  templateUrl: './email-verified.component.html'
})
export class EmailVerifiedComponent implements OnInit {
  isLoading = true;
  hasValidToken;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.validate()
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
