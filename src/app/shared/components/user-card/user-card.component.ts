import { LearningObjectService } from '../../../cube/learning-object.service';
import { UserService } from 'app/core/user-module/user.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { User, LearningObject } from '@entity';
import { ModalService, ModalListElement } from '../../modules/modals/modal.module';

@Component({
  selector: 'clark-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  providers: [LearningObjectService]
})
export class UserCardComponent implements OnInit, OnChanges {
  @Input() user: User;
  @Input() link = true; // flag for routerlink
  @Input() gravatarInfo = false; // flag for showing gravatar information

  objects: Array<LearningObject>;
  icon: string;
  imgSize: number;
  constructor(private learningObjectService: LearningObjectService, private userService: UserService, private modals: ModalService) { }
  ngOnInit() {
    this.imgSize = 100;
    this.icon = this.userService.getGravatarImage(this.user.email, this.imgSize);
  }

  ngOnChanges() {
    this.fetchLearningObjects();
  }

  async fetchLearningObjects() {
    this.objects = await this.learningObjectService.getUsersLearningObjects(this.user.username);
  }

  showGravatarModal(e: Event) {
    // if the gravatar icon is clicked, the page shouldn't navigate
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const accept = new ModalListElement('Got it!', 'accept', 'good');
    const learn = new ModalListElement('Learn More', 'learn', 'neutral');

    this.modals.makeDialogMenu(
      'gravatarModal',
      'CLARK uses Gravatar!',
      // eslint-disable-next-line max-len
      `A Gravatar is a Globally Recognized Avatar. You upload it and create your profile just once, and then when you participate in any Gravatar-enabled site, your Gravatar image will automatically follow you there. <br /><br /> A Gravatar account is not required to register for CLARK, but it is highly encouraged for recognition in the cyber security education community.`,
      true,
      undefined,
      'center',
      [accept, learn]
    ).subscribe(res => {
      if (res === 'learn') {
        // learn more
        window.open('https://en.gravatar.com/support/what-is-gravatar/');
      } else {
        // either accepted or canceled
        this.modals.closeAll();
      }
    });
  }
}
