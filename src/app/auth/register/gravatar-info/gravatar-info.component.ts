import { Component, OnInit, Input } from '@angular/core';
import * as md5 from 'md5';
import { FormGroup } from '@angular/forms';
import { User } from '../../../../entity/index';

@Component({
  selector: 'clark-gravatar-info',
  templateUrl: './gravatar-info.component.html',
  styleUrls: ['./gravatar-info.component.scss']
})
export class GravatarInfoComponent implements OnInit {
  @Input() group: FormGroup;
  user: User;

  size = 200;
  default: string;
  imgUrl: string;

  constructor() {
    this.default = 'identicon';
  }

  ngOnInit() {
    this.imgUrl = this.getGravatarImage();
    this.user = new User(
      {
        name: this.group.value.firstname + ' ' + this.group.value.lastname,
        ...this.group.value
      }
    );
  }

  getGravatarImage(): string {
    // r=pg checks the rating of the Gravatar image
    return (
      'https://www.gravatar.com/avatar/' +
      md5(this.group.value.email) +
      '?s=' +
      this.size +
      '?r=pg&d=' +
      this.default
    );
  }
}
