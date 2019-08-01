import { Router } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { AuthService } from '../../../core/auth.service';
import { LearningObject, User } from '@entity';
import { ToasterService } from '../../../shared/shared modules/toaster';
import { COPY } from './user-information.copy';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit, OnChanges {
  copy = COPY;
  // User Information
  @Input() user: User;
  @Input() self = false;
  objects: LearningObject[] = Array(5).fill(new LearningObject());
  loading = false;

  constructor(
    private learningObjectService: LearningObjectService,
    private auth: AuthService,
    private router: Router,
    private notifications: ToasterService
  ) {}

  ngOnInit() {}

  ngOnChanges() {
    this.getUsersLearningObjects();
  }

  navigateToOrganizationPage() {
    this.router.navigate(['/organization', { query: this.user.organization }]);
  }

  async getUsersLearningObjects() {
    this.loading = true;
    this.objects = await this.learningObjectService.getUsersLearningObjects(
      this.user.username
    );
    this.loading = false;
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
        await this.auth.sendEmailVerification(this.user.email).toPromise();
        this.notifications.notify(
          `Success!`,
          `Email sent to ${this.user.email}. Please check your inbox and spam.`,
          'good',
          'far fa-check'
        );
      }
    } catch (e) {
      this.notifications.notify(`Could not send email`, `${e}`, 'bad', '');
    }
  }

  printCards() {
    this.auth.printCards(
      this.user.username,
      this.user.name,
      this.user.organization
    );
  }
}
