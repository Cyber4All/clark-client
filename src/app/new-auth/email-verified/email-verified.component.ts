import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-email-verified',
  templateUrl: './email-verified.component.html',
  styleUrls: ['./email-verified.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class EmailVerifiedComponent implements OnInit {
  iconSuccess: Boolean; // what icon to display
  h1Message: String; // h1 content
  pMessage: String; // paragraph content
  errorCode: String; // error to display, can be expired token or internal server error
  display: Boolean = true;

  constructor(private authService: AuthService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.errorCode = this.activatedRoute.snapshot.queryParamMap.get('err');
    if(this.errorCode) {
      this.iconSuccess = false;
      if(this.errorCode === '401') {
        this.h1Message = 'Email Link Expired';
        this.pMessage = 'Please login to resend your email verification/reset password link to your email.';
      } else {
        this.h1Message = 'Unable to Verify Email';
        this.pMessage = 'We were unable to verify your email at this time. Please check back later.';
      }
    } else {
      this.authService.validateAndRefreshToken()
      .then(async () => {
        // Email successfully verified, display success content to user
        this.iconSuccess = true;
        this.h1Message = 'Email Verified!';
        this.pMessage = 'Enjoy CLARK!';
      })
      .catch(e => {
        // Token refresh error, display in banner
      });
    }
  }

}
