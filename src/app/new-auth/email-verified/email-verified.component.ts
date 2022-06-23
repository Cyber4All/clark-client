import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-email-verified',
  templateUrl: './email-verified.component.html',
  styleUrls: ['./email-verified.component.scss']
})
export class EmailVerifiedComponent implements OnInit {

  iconSuccess: Boolean; // what icon to display
  h1Message: String; // h1 content
  pMessage: String; // paragraph content
  display: Boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.validateAndRefreshToken()
      .then(async () => {
        // Email successfully verified, display success content to user
        this.iconSuccess = true;
        this.h1Message = 'Email Verified!';
        this.pMessage = 'Enjoy CLARK!';
      })
      .catch(e => {
        // Email unsuccessful, display error (expired link or internal error)
      });
  }

}
