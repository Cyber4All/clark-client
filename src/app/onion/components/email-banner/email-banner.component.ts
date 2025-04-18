import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth-module/auth.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

@Component({
  selector: 'clark-email-banner',
  templateUrl: './email-banner.component.html',
  styleUrls: ['./email-banner.component.scss']
})
export class EmailBannerComponent implements OnInit {

  constructor(private auth: AuthService, private toasterService: ToastrOvenService) { }

  ngOnInit() {
  }

  /**
   * Sends email verification email
   *
   * @memberof UserInformationComponent
   */
  public async sendEmailVerification() {
    try {
      await this.auth.validateToken();

      if (!this.auth.user.emailVerified) {
        await this.auth.sendEmailVerification().toPromise();
        this.toasterService.success(
          `Success!`,
          `Email sent to ${this.auth.user.email}.
          Please check your inbox and spam.
          If you don't receive an email within 15 minutes reach out to info@secured.team.`
          );
      }
    } catch (e) {
      this.toasterService.error(`Could not send email`, `${e}`);
    }
  }

}
