import { Router } from '@angular/router';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { AuthService } from '../../../core/auth.service';
import { LearningObject, User } from '@entity';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { COPY } from './user-information.copy';

@Component({
  selector: 'clark-user-information',
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
    private notifications: ToastrOvenService
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
        this.notifications.success(`Success!`, `Email sent to ${this.user.email}. Please check your inbox and spam.`);
      }
    } catch (e) {
      this.notifications.error(`Could not send email`, `${e}`);
    }
  }
}
