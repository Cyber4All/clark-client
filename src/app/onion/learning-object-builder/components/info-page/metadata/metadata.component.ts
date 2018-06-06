import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AcademicLevel, User } from '@cyber4all/clark-entity';
import { LearningObjectErrorStoreService } from '../../../errorStore';
import { TextQuery } from '../../../../../shared/interfaces/query';
import { UserService } from '../../../../../core/user.service';
import { runInThisContext } from 'vm';

// TODO: Apply .bad to input if the form is submitted and it's not valid

@Component({
  selector: 'onion-learning-object-metadata',
  templateUrl: 'metadata.component.html',
  styleUrls: [ 'metadata.component.scss' ]
})
export class LearningObjectMetadataComponent implements OnInit, OnDestroy {
  @Input() isNew;
  @Input() learningObject;

  users = '';
  arrayOfKeys = [];
  tempArrayOfKeys = [];
  json = '';
  author = false;
  user: User;
  connected = false;
  connection;

  query: TextQuery = {
    text: '',
    currPage: 1,
    limit: 30
  };

  public tips = TOOLTIP_TEXT;
  validName = /([A-Za-z0-9_()`~!@#$%^&*+={[\]}\\|:;"'<,.>?/-]+\s*)+/i;
  academicLevels = Object.values(AcademicLevel);

  constructor(
    private errorStore: LearningObjectErrorStoreService,
    private userService: UserService
  ) { }

  ngOnInit() {
   // image =  this.userService.getGravatarImage(this.user.email, 200);
   // this.attemptSocketConnection();
  }

  toggleLevel(level: AcademicLevel) {
    const index = this.learningObject.levels.indexOf(level);
    if (index > -1) {
      this.learningObject.removeLevel(index);
    } else {
      this.learningObject.addLevel(level);
    }
  }

  keyUpSearch(event) {
    // if (event.keyCode === 13) {
    //   this.search();
    // }
    this.search();
  }
  search() {
    this.query.text = this.query.text.trim();
      this.userService.searchUsers(this.query.text).then(val => {
        this.users = JSON.parse(val);
        this.tempArrayOfKeys = Object.keys(this.users);
         // Limit search results to 10
         if (this.tempArrayOfKeys.length <= 10) {
          this.arrayOfKeys = this.tempArrayOfKeys;
         } else {
            for (let i = 0; i < 10; i++) {
              this.arrayOfKeys[i] = this.tempArrayOfKeys[i];
            }
          }
          if (this.query.text === '') {
            console.log('delete');
            this.arrayOfKeys = [];
            this.tempArrayOfKeys = [];
          }
      });
  }

  // Checks to see if a socket connection already exists, if not ... establish socket connection
  // our observable returns a subscription object that we can use to unsubscribe and break the connection.
//   attemptSocketConnection(): boolean {
//     if (!this.connected) {
//       this.connection = this.userService.searchUsers(this.query.text.trim()).subscribe(users => {
//         // events
//         // Update list of users.
//         this.users = users;
//         console.log('socket.io connected!');
//       });
//       this.connected = true;
//       return true;
//     }
//     this.connected = false;
//     return false;
// }

sendSearchQuery() {
  this.userService.sendSearchQuery(this.query.text);
  this.users = '';
}

ngOnDestroy() {
  this.connection.unsubscribe();
}

