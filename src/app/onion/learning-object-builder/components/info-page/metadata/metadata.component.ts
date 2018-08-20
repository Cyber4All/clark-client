import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AcademicLevel, User, LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectErrorStoreService } from '../../../errorStore';
import { UserService } from '../../../../../core/user.service';
import { AuthService } from '../../../../../core/auth.service';
import { runInThisContext } from 'vm';
import { Subscription, Observable } from 'rxjs';
import { Query } from '../../../../../shared/interfaces/query';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

// TODO: Apply .bad to input if the form is submitted and it's not valid

@Component({
  selector: 'onion-learning-object-metadata',
  templateUrl: 'metadata.component.html',
  styleUrls: [ 'metadata.component.scss' ]
})
export class LearningObjectMetadataComponent implements OnInit, OnDestroy {
  @Input() isNew;
  @Input() learningObject;
  @ViewChild('userSearchInput', { read: ElementRef })
  userSearchInput: ElementRef;

  users;
  arrayOfUsers = [];
  selectedAuthors = [];
  connected = false;
  connection;

  query: Query= {
    text: '',
    currPage: 1,
    limit: 30
  };

  // array of subscriptions to destroy on component destroy
  subs: Subscription[] = [];

  public tips = TOOLTIP_TEXT;
  validName = /([A-Za-z0-9_()`~!@#$%^&*+={[\]}\\|:;"'<,.>?/-]+\s*)+/i;
  academicLevels = Object.values(AcademicLevel);

  constructor(
    public errorStore: LearningObjectErrorStoreService,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(Observable.fromEvent(this.userSearchInput.nativeElement, 'input')
      .debounceTime(650)
      .subscribe(val => {
        this.search();
      })
    );
      if (this.learningObject.contributors) {
        this.selectedAuthors = this.learningObject.contributors;
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

  search() {
    this.query.text = this.query.text.trim();
      this.userService.searchUsers(this.query.text).then(val => {
         // Remove current user from results
         for (let i = 0; i < val.length; i++) {
          if (this.authService.username === val[i].username) {
            val.splice(i, 1);
          }
         }
         // Limit search results to 10
         if (val.length <= 10) {
          this.arrayOfUsers = val;
         } else {
            for (let i = 0; i < 10; i++) {
              this.arrayOfUsers[i] = val[i];
            }
          }
          // If query is empty, remove previous results
          if (this.query.text === '') {
            this.arrayOfUsers = [];
          }
      });
  }

  addAuthor(index) {
    if (this.isAuthorSelected) {
      this.selectedAuthors.push(this.arrayOfUsers[index]);
      this.learningObject.contributors = this.selectedAuthors;
    }
  }

  removeAuthor(user) {
    for (let i = 0; i < this.selectedAuthors.length; i++) {
      if (user.username === this.selectedAuthors[i].username) {
        this.selectedAuthors.splice(i, 1);
      }
    }
  }

  isAuthorSelected(index) {
    for (let i = 0; i < this.selectedAuthors.length; i++) {
      if (this.arrayOfUsers[index].username === this.selectedAuthors[i].username) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy() {
     // unsubscribe from all observables
     for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }
  }

}

