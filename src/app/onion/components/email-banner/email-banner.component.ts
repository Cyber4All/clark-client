import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { ToasterService } from 'app/shared/Shared Modules/toaster';

@Component({
  selector: 'clark-email-banner',
  templateUrl: './email-banner.component.html',
  styleUrls: ['./email-banner.component.scss']
})
export class EmailBannerComponent implements OnInit {

  constructor(private auth: AuthService, private toasterService: ToasterService) { }

  ngOnInit() {
  }

  /**
   * Sends email verification email
   *
   * @memberof UserInformationComponent
   */
  public async sendEmailVerification() {
    try {
      await this.auth.validateAndRefreshToken();

      if (!this.auth.user.emailVerified) {
        await this.auth.sendEmailVerification().toPromise();
        this.toasterService.notify(
          `Success!`,
          `Email sent to ${this.auth.user.email}. Please check your inbox and spam.`,
          'good',
          'far fa-check'
        );
      }
    } catch (e) {
      this.toasterService.notify(`Could not send email`, `${e}`, 'bad', '');
    }
  }

}
