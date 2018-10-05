import { ModalService, ModalListElement } from '../../shared/modals';
import { ToasterService } from '../../shared/toaster';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { LearningObjectService } from '../core/learning-object.service';
import { LearningObject, AcademicLevel } from '@cyber4all/clark-entity';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { LearningObjectStoreService } from './store';
import { LearningObjectErrorStoreService } from './errorStore';
import { AuthService } from 'app/core/auth.service';
import { CollectionService } from 'app/core/collection.service';

enum PAGES {
  INFO,
  OUTCOMES
}

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

  learningObjectName: string;
  isNew = false;
  submitted = 0;

  submitToCollection = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: LearningObjectService,
    private collectionService: CollectionService,
    private modalService: ModalService,
    private notificationService: ToasterService,
    private store: LearningObjectStoreService,
    private errorStore: LearningObjectErrorStoreService,
    public auth: AuthService
  ) {
    this.learningObject = new LearningObject(this.auth.user);
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
      // fetch this learning object from route reolver (returns LO or returns undefined)
      this.learningObject = this.route.snapshot.data['learningObject'];
      if (!this.learningObject) {
        this.router.navigate(['/onion/dashboard']);
      }

    } else {
      this.isNew = true;
    }

  }

  /**
   * Saves Learning Object
   * If new creates LearningObject else updates existing LearningObject
   * If will upload navigates to content upload else navigates back to dashboard
   *'

   * @param {boolean} willUpload
   * @memberof LearningObjectBuilderComponent
   */
  async save(willUpload: boolean) {
    if (!willUpload && (this.isNew || !this.auth.user.emailVerified)) {
      if (!(await this.showSubmissionDialog())) {
        return;
      }
    }

    this.learningObject.date = Date.now().toString();
    this.learningObject.name = this.learningObject.name.trim();
    if (!this.isNew) {
      // editing
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
            this.router.navigate([
              `/onion/content/upload/${this.learningObjectName}`
            ]);
          }
        })
        .catch(err => {
          console.log(err)
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
      // creating
      this.service
        .create(this.learningObject)
        .then(newObject => {
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

  private async showSubmissionDialog(): Promise<boolean> {
    const text = this.auth.user.emailVerified
      ? 'You can submit this learning object for review now, or save it for later. If you don\'t submit now, you can submit from your Dashboard at a later time.'
      : 'You must have a verfied email address to submit learning objects! Would you like to verfiy your email now?';

    const buttons = [
      new ModalListElement(
        'Save for later<i class="far fa-undo-alt " id="save-for-later"></i>',
        'reject',
        'neutral on-white'
      )
    ];

    if (this.auth.user.emailVerified) {
      buttons.unshift(
        new ModalListElement(
          'Submit for Review!<i class="far fa-check-circle"></i>',
          'accept',
          'good'
        )
      );
    } else {
      buttons.unshift(
        new ModalListElement(
          'Verify your email!<i class="far fa-at"></i>',
          'verify-email',
          'good'
        )
      );
    }

    const publish = await this.modalService
      .makeDialogMenu(
        'PublishConfirmation',
        'Submit learning object for review?',
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
        this.notificationService.notify(
          `Could not send email`,
          `${e}`,
          'bad',
          ''
        );
      }
    } else {
      switch (publish) {
        case 'accept':
          // TODO refactor this flow
          this.submitToCollection = true;
          return true;
        case 'reject':
          this.learningObject.unpublish();
          return true;
        default:
          return false;
      }
    }
  }

  /**
   * Publishes a learning object and adds it to a specified collection
   * @param collection the name of the collection to add this learning object to
   */
  addToCollection(collection?: string) {
    if (collection) {
      // first, attempt to publish
      this.service.togglePublished(this.learningObject).then(() => {
        // publishing was a success, attempt to add to collection
        this.collectionService.addToCollection(this.learningObject.id, collection).then(() => {
          // success
          this.notificationService.notify(
            'Success!',
            `Learning object submitted to ${collection} collection successfully!`,
            'good',
            'far fa-check'
          );
        }).catch (err => {
          // error
          console.error(err);
          this.notificationService.notify(
            'Error!',
            `Error submitting learning object to ${collection} collection!`,
            'bad',
            'far fa-times'
          );
        });
      }).catch(error => {
        // failed to publish
        this.notificationService.notify(
          'Error!',
          error.error,
          'bad',
          'far fa-times'
        );
        console.error(error);
      });
    } else {
      console.error('No collection defined!');
    }

    this.submitToCollection = false;
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
   * Adds new LearningOutcome to LearningObject
   *
   * @memberof LearningObjectBuilderComponent
   */
  newOutcome() {
    const newOutcome = this.learningObject.addOutcome();
    return newOutcome;
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
      this.notificationService.notify(
        'Error!',
        'Please enter a name for this learning object!',
        'bad',
        'far fa-times'
      );
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
    const badOutcomes = this.learningObject.outcomes
      .map((x, i) => (!x.text || x.text === '' ? i : undefined))
      .filter(x => x !== undefined);
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
      this.notificationService.notify(
        'Error!',
        'You cannot submit a learning outcome without outcome text!',
        'bad',
        'far fa-times'
      );
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
    const modifier = 1;
    const action =
      this.activePage + modifier === PAGES.OUTCOMES
        ? 'NAVIGATEPARENT'
        : 'NAVIGATE';

    this.store.dispatch({
      type: action,
      request: {
        sectionIndex: this.activePage + modifier,
        childSection:
          this.activePage + modifier === PAGES.OUTCOMES ? 0 : undefined
      }
    });
  }
}
