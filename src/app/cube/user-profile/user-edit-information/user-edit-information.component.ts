import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { UserService } from '../../../core/user.service';
import { AuthService } from '../../../core/auth.service';
import { ToasterService } from '../../../shared/toaster';
import { Subscription, Observable, Subject, fromEvent } from 'rxjs';
import { COPY } from './user-edit-information.copy';

import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'cube-app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.scss']
})

export class UserEditInformationComponent implements OnInit, OnChanges, OnDestroy {
  copy = COPY;
  isDestroyed$ = new Subject<void>();
  elementRef: any;
  @Input() user;
  @Input() self = false;
  @Output('close') close = new EventEmitter<boolean>();

  @ViewChild('organization', { read: ElementRef })
  organization: ElementRef;

  counter = 140;

  organizationsList = [];
  isValidOrganization: boolean;

  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
    bio: ''
  };

  userInfo = {
    username: '',
    password: ''
  };

  // array of subscriptions to destroy on component destroy
  subs: Subscription[] = [];

  constructor(
    private userService: UserService,
    private noteService: ToasterService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    fromEvent(this.organization.nativeElement, 'input')
      .takeUntil(this.isDestroyed$)
      .debounceTime(400)
      .subscribe(val => {
          this.getOrganizations();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.editInfo = {
        firstname: this.toUpper(this.user.name) ? this.toUpper(this.user.name.split(' ')[0]) : '',
        lastname: this.toUpper(this.user.name) ? this.toUpper(this.user.name.substring(this.user.name.indexOf(' ') + 1)) : '',
        email: this.user.email || '',
        organization: this.toUpper(this.user.organization) || '',
        bio: this.user.bio || ''
      };
    }
  }
  /**
   * Saves User's information edits
   *
   * @private
   * @memberof UserEditInformationComponent
   */
  async save() {
    const edits: UserEdit = {
      name: `${this.editInfo.firstname.trim()} ${this.editInfo.lastname.trim()}`,
      email: this.editInfo.email.trim(),
      organization: this.editInfo.organization.trim(),
      bio: this.editInfo.bio.trim()
    };
    if (await this.checkOrganization()) {
      try {
        await this.userService.editUserInfo(edits);
        await this.auth.validate();
        this.close.emit(true);
        this.noteService.notify('Success!', 'We\'ve updated your user information!', 'good', 'far fa-check');
      } catch (e) {
        this.noteService.notify('Error!', 'We couldn\'t update your user information!', 'bad', 'far fa-times');
      }
    } else {
      this.noteService.notify('Invalid Organization!', 'Please select a provided orgnization from the dropdown!', 'bad', 'far fa-times');
    }
  }

  handleCounter(e) {
    const inputLength = this.editInfo.bio.length;
    this.counter = 140 - inputLength;
  }

  getOrganizations() {
    this.auth.getOrganizations(this.editInfo.organization).then(val => {
        // Display top 5 matching organizations
        for (let i = 0; i < 5; i++) {
          if (val[i]) {
            this.organizationsList[i] = val[i]['institution'];
          }
        }
        // If no results, destroy results display
        if (!val[0]) {
          this.organizationsList = [];
        }
        // If no query, destroy results display
        if (this.editInfo.organization === '') {
          this.organizationsList = [];
        }
    });
  }

  chooseOrganization(organization: string) {
    this.editInfo.organization = organization;
  }

  private toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
  }

  checkOrganization() {
    // If field is empty, return false
    if (this.editInfo.organization === '') {
      return false;
    }
    // Allow the user to enter an org that does not exist in our
    // database when empty results are returned
    if (this.organizationsList.length > 0) {
      for (let i = 0; i < this.organizationsList.length; i++) {
        if (this.editInfo.organization === this.organizationsList[i]) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  ngOnDestroy() {
     this.isDestroyed$.next();
     this.isDestroyed$.unsubscribe();
  }
}



export interface UserEdit {
  name: string;
  email: string;
  organization: string;
  bio: string;
}
