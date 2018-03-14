import { ModalService, ModalListElement } from '../../shared/modals';
import { NotificationService } from '../../shared/notifications';
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { LearningObjectService } from '../core/learning-object.service';
import { User, LearningObject, AcademicLevel } from '@cyber4all/clark-entity';
import { verbs, assessments, quizzes, instructions } from 'clark-taxonomy';

@Component({
  selector: 'onion-learning-object-builder',
  templateUrl: './learning-object-builder.component.html',
  styleUrls: ['./learning-object-builder.component.scss']
})
export class LearningObjectBuilderComponent implements OnInit {
  learningObject: LearningObject = new LearningObject();

  classverbs: { [level: string]: Set<string> } = verbs;
  testquizstrategies: { [level: string]: Set<string> } = quizzes;
  classassessmentstrategies: { [level: string]: Set<string> } = assessments;
  instructionalstrategies: { [level: string]: Set<string> } = instructions;
  academicLevels = Object.values(AcademicLevel);

  learningObjectName: string;
  isNew = false;
  submitted = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: LearningObjectService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    console.log(this.learningObject.level, this.learningObject.length);
    this.getRouteParams();
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
      this.learningObjectName = this.route.snapshot.params[
        'learningObjectName'
      ];
      this.loadLearningObject();
    } else {
      this.isNew = true;
    }
  }
  /**
   * Loads LearningObject by ID
   * Logs error if unable to fetch LearningObject
   *
   * @memberof LearningObjectBuilderComponent
   */
  loadLearningObject(): void {
    this.service
      .getLearningObject(this.learningObjectName)
      .then(learningObject => {
        this.learningObject = learningObject;
      })
      .catch(err => {
        this.isNew = true;
      });
  }

  parseFromContextMenu(msg) {
    if (msg === 'logout') {
      this.modalService.action.emit('logout');
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
    const publish = await this.modalService
      .makeDialogMenu(
        'PublishConfirmation',
        'Publish changes?',
        '',
        'title-good',
        'center',
        [
          new ModalListElement(
            'Save & Publish!<i class="far fa-check-circle"></i>',
            'accept',
            'good'
          ),
          new ModalListElement(
            'Save for later<i class="far fa-undo-alt "></i>',
            'reject',
            'neutral on-white'
          )
        ]
      )
      .toPromise();
    publish === 'accept'
      ? this.learningObject.publish()
      : this.learningObject.unpublish();

    this.learningObject.date = Date.now().toString();
    if (!this.isNew) {
      this.service
        .save(this.learningObject)
        .then(success => {
          this.notificationService.notify(
            'Done!',
            'Learning Object saved!',
            'alerting',
            'fal fa-save'
          );
          willUpload
            ? this.router.navigateByUrl(
                `/onion/content/upload/${this.learningObjectName}`
              )
            : this.router.navigate(['/onion']);
        })
        .catch(err => {
          const error =
            typeof err['_body'] == 'string'
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
        .then(() => {
          this.notificationService.notify(
            'Done!',
            'New Learning Object created!',
            'good',
            'far fa-check'
          );
          willUpload
            ? this.router.navigateByUrl(
                `/onion/content/upload/${this.learningObject.name}`
              )
            : this.router.navigate(['/onion']);
        })
        .catch(err => {
          const error =
            typeof err['_body'] == 'string'
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
    // FIXME: This should be handled API side
    if (newOutcome.verb === 'Define') {
      newOutcome.verb = 'Choose';
    }
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
  bindEditorOutput(event, type, i, s): void {
    if (type === 'question') {
      this.learningObject.outcomes[i].assessments[s].text = event;
    } else {
      if (type === 'strategy') {
        this.learningObject.outcomes[i].strategies[s].text = event;
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
    // check name
    if (this.learningObject.name === '') {
      return false;
    }

    // check outcomes
    const o: NodeListOf<Element> = document.querySelectorAll(
      'onion-learning-outcome-component > .container'
    );
    for (const outcome of Array.from(o)) {
      if (outcome.attributes['valid'].value !== 'true') { return false; }
    }

    return true;
  }
}
