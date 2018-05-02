import { ModalService, ModalListElement } from '../../shared/modals';
import { NotificationService } from '../../shared/notifications';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { LearningObjectService } from '../core/learning-object.service';
import { User, LearningObject, AcademicLevel } from '@cyber4all/clark-entity';
import {
  verbs,
  assessments,
  quizzes,
  instructions
} from '@cyber4all/clark-taxonomy';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { LearningObjectStoreService } from './store';
import { LearningObjectErrorStoreService } from './errorStore';

enum PAGES {
  INFO,
  OUTCOMES
}
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'onion-learning-object-builder',
  templateUrl: './learning-object-builder.component.html',
  styleUrls: ['./learning-object-builder.component.scss'],
  providers: [LearningObjectStoreService, LearningObjectErrorStoreService]
})
export class LearningObjectBuilderComponent implements OnInit {
  public PAGES = PAGES;
  public activePage = PAGES.INFO;
  public childIndex;
  public tips = TOOLTIP_TEXT;

  learningObject: LearningObject = new LearningObject();

  classverbs: { [level: string]: Set<string> } = verbs;
  testquizstrategies: { [level: string]: Set<string> } = quizzes;
  classassessmentstrategies: { [level: string]: Set<string> } = assessments;
  instructionalstrategies: { [level: string]: Set<string> } = instructions;
  academicLevels = Object.values(AcademicLevel);

  learningObjectName: string;
  isNew = false;
  submitted = 0;

  validName = /([A-Za-z0-9_()`~!@#$%^&*+={[\]}\\|:;"'<,.>?/-]+\s*)+/i;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: LearningObjectService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private store: LearningObjectStoreService,
    private errorStore: LearningObjectErrorStoreService,
    private auth: AuthService,
  ) {
  }

  ngOnInit() {
    this.learningObject.addGoal('');
    this.getRouteParams();
    this.store.dispatch({
      type: 'INIT',
      request: {
        initialSection: 0
      }
    });
    this.store.state.subscribe(state => {
      this.changePage(state.section, state.childSection);
    });
  }
  /**
   * Grabs parameters in route (Learning Object's ID)
   * If ID is present calls loadLearningObject
   * Else sets isNew = true
   *
   * @memberof LearningObjectBuilderComponent
   */
  getRouteParams(): void {
    if (this.route.snapshot.params['learningObjectName']) {
      if (!this.learningObjectName) {
        this.learningObjectName = this.route.snapshot.params[
          'learningObjectName'
        ];
      }
      this.learningObject = this.route.snapshot.data['learningObject'];
    } else {
      this.isNew = true;
    }
  }

  /**
   * Saves Learning Object
   * If new creates LearningObject else updates existing LearningObject
   * If will upload navigates to content upload else navigates back to dashboard
   *
   * @param {boolean} willUpload
   * @memberof LearningObjectBuilderComponent
   */
  async save(willUpload: boolean) {
    if (!willUpload && (this.isNew || !this.auth.user.emailVerified)) {

      if (!await this.showPublishingDialog()) {
        return;
      }
    }

    this.learningObject.date = Date.now().toString();
    this.learningObject.name = this.learningObject.name.trim();
    if (!this.isNew) {
      this.service
        .save(this.learningObject)
        .then(success => {
          if (!willUpload) {
            this.notificationService.notify(
              'Done!',
              'Learning Object saved!',
              'good',
              'far fa-check'
            );
            this.isNew = false;
            this.learningObjectName = this.learningObject.name;
          } else {
            this.router.navigate([`/onion/content/upload/${this.learningObjectName}`]);
          }
        })
        .catch(err => {
          const error =
            typeof err['_body'] === 'string'
              ? err['_body']
              : 'Error saving Learning Object';
          this.notificationService.notify(
            'Error!',
            error,
            'bad',
            'far fa-times'
          );
        });
    } else {
      this.service
        .create(this.learningObject)
        .then((newObject) => {
          if (!willUpload) {
            this.notificationService.notify(
              'Done!',
              'New Learning Object created!',
              'good',
              'far fa-check'
            );
            this.isNew = false;
            this.learningObject = newObject;
            this.learningObjectName = this.learningObject.name;
          } else {
            this.router.navigateByUrl(
              `/onion/content/upload/${this.learningObject.name}`
            );
          }
        })
        .catch(err => {
          const error =
            typeof err['_body'] === 'string'
              ? err['_body']
              : 'Error creating Learning Object';
          this.notificationService.notify(
            'Error!',
            error,
            'bad',
            'far fa-times'
          );
        });
    }
  }

  private async showPublishingDialog(): Promise<boolean> {
    const text =
    this.auth.user.emailVerified ?
    '' : 'You must have a verfied email address to publish learning objects! Would you like to verfiy your email now?';

    const buttons = [
      new ModalListElement(
        'Save for later<i class="far fa-undo-alt "></i>',
        'reject',
        'neutral on-white'
      )
    ];

    if (this.auth.user.emailVerified) {
      buttons.unshift(
        new ModalListElement(
          'Save & Publish!<i class="far fa-check-circle"></i>',
          'accept',
          'good'
        ),
      );
    } else {
      buttons.unshift(
        new ModalListElement(
          'Verify your email!<i class="far fa-at"></i>',
          'verify-email',
          'good'
        ),
      );
    }

    const publish = await this.modalService
      .makeDialogMenu(
        'PublishConfirmation',
        'Publish changes?',
        text,
        true,
        '',
        'center',
        buttons
      )
      .toPromise();

    if (publish === 'verify-email') {
      try {
        await this.auth.sendEmailVerification(this.auth.email).toPromise();
        await this.auth.validate();
        this.notificationService.notify(
          'Done!',
          `An email was sent to ${this.auth.email}`,
          'good',
          'far fa-check'
        );
      } catch (e) {
        this.notificationService.notify(`Could not send email`, `${e}`, 'bad', '');
      }
    } else {
      switch (publish) {
        case 'accept':
          this.learningObject.publish();
          return true;
        case 'reject':
          this.learningObject.unpublish();
          return true;
        default:
          return false;
      }
    }
  }

  toggleLevel(level: AcademicLevel) {
    const index = this.learningObject.levels.indexOf(level);
    if (index > -1) {
      this.learningObject.removeLevel(index);
    } else {
      this.learningObject.addLevel(level);
    }
  }
  /**
   * Adds new LearningGoal to LearningObject
   *
   * @memberof LearningObjectBuilderComponent
   */
  newGoal(): void {
    this.learningObject.addGoal('');
  }
  /**
   * Adds new LearningOutcome to LearningObject
   *
   * @memberof LearningObjectBuilderComponent
   */
  newOutcome() {
    const newOutcome = this.learningObject.addOutcome();
    return newOutcome;
  }

  deleteGoal(i) {
    this.learningObject.removeGoal(i);
  }
  /**
   * Deletes LearningOutcome from LearningObject
   *
   * @param {number} index
   * @memberof LearningObjectBuilderComponent
   */
  deleteOutcome(index: number): void {
    this.learningObject.removeOutcome(index);
  }
  /**
   * Deletes InstructionalStrategy from LearningObject's LearningOutcomes
   *
   * @param {number} index
   * @param {number} s
   * @memberof LearningObjectBuilderComponent
   */
  deleteStrategy(index: number, s: number): void {
    this.learningObject.outcomes[index].removeStrategy(s);
  }
  /**
   * Deletes AssessmentPlan from LearningObject's LearningOutcomes
   *
   * @param {number} index
   * @param {number} s
   * @memberof LearningObjectBuilderComponent
   */
  deleteQuestion(index: number, s: number): void {
    this.learningObject.outcomes[index].removeAssessment(s);
  }

  /**
   * Captures output and binds the textEditor's text from the textEditorComponent to the learningObject
   *
   * @param {number} event
   * @param {number} type
   * @param {number} i
   * @param {number} s
   * @memberof LearningObjectBuilderComponent
   */
  bindEditorOutput(event, type: string, i?: number, s?: number): void {
    if (type === 'question') {
      this.learningObject.outcomes[i].assessments[s].text = event;
    } else if (type === 'strategy') {
        this.learningObject.outcomes[i].strategies[s].text = event;
    } else {
      if (event !== '') {
        this.learningObject.goals[0].text = event;
      }
    }
  }

  showFormErrors() {
    this.submitted++;
    this.notificationService.notify(
      'Error!',
      'Please complete all required fields!',
      'bad',
      'fal fa-times'
    );
  }

  validate(): boolean {
    this.errorStore.clear();
    // check name
    if (this.learningObject.name === '') {
      this.notificationService.notify('Error!', 'Please enter a name for this learning object!', 'bad', 'far fa-times');
      this.errorStore.set('name');
      this.store.dispatch({
        type: 'NAVIGATE',
        request: {
          sectionIndex: 0
        }
      });
      return false;
    }
    // check outcomes
    const badOutcomes = this.learningObject.outcomes.map(
      (x, i) => (!x.text || x.text === '') ? i : undefined
    ).filter(x => x !== undefined);
    if (badOutcomes.length) {
      this.errorStore.set('outcometext');
      this.store.dispatch({
        type: 'NAVIGATE',
        request: {
          sectionIndex: 1
        }
      });
      this.store.dispatch({
        type: 'NAVIGATECHILD',
        request: {
          sectionIndex: badOutcomes[0]
        }
      });
      this.notificationService.notify('Error!', 'You cannot submit a learning outcome without outcome text!', 'bad', 'far fa-times');
      return false;
    }
    return true;
  }

  changePage(page, childPage) {
    switch (page) {
      case 0:
        this.activePage = PAGES.INFO;
        break;
      case 1:
        this.activePage = PAGES.OUTCOMES;
        this.childIndex = childPage;
        break;
      case 2:
        if (this.validate()) {
          this.save(true);
        }
    }
  }

  advanceSection() {
    this.store.dispatch({
      type: 'NAVIGATE',
      request: {
        sectionModifier: 1
      }
    });
  }

  togglePublished(event) {
    if (this.auth.user.emailVerified) {
      if (this.learningObject.published) {
        this.learningObject.unpublish();
      } else {
        this. learningObject.publish();
      }
    }
  }
}
