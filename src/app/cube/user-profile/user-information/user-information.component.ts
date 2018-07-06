import { UserService } from './../../../core/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
  USER_ROUTES,
  PUBLIC_LEARNING_OBJECT_ROUTES
} from '../../../../environments/route';
import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { AuthService } from '../../../core/auth.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Http, Headers, ResponseContentType } from '@angular/http';
import { NotificationService } from '../../../shared/notifications';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss']
})
export class UserInformationComponent implements OnInit, OnChanges {
  // User Information
  @Input() user: User;
  @Input() self = false;
  objects: LearningObject[] = Array(5).fill(new LearningObject());
  loading = false;

  constructor(
    private learningObjectService: LearningObjectService,
    private auth: AuthService,
    private http: Http,
    private router: Router,
    private notifications: NotificationService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getUsersLearningObjects();
  }

  navigateToOrganizationPage() {
    this.router.navigate(['/organization', { query: this.user.organization }]);
  }

  async getUsersLearningObjects() {
    this.loading = true;
    this.objects = await this.learningObjectService.getUsersLearningObjects(this.user.username);
    this.loading = false;
  }
  /**
   * Sends email verification email
   *
   * @memberof UserInformationComponent
   */
  public async sendEmailVerification() {
    try {
      await this.auth.sendEmailVerification(this.user.email).toPromise();
      await this.auth.validate();
      this.notifications.notify(
        `Email sent to ${this.user.email}`,
        `Please check your inbox and spam.`,
        'good',
        'far fa-check'
      );
    } catch (e) {
      this.notifications.notify(`Could not send email`, `${e}`, 'bad', '');
    }
  }

  printCards() {
    this.auth.printCards();
  }
}
