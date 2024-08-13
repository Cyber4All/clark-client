import { Component, OnInit, Input } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user-module/user.service';

@Component({
  selector: 'clark-changelog-item',
  templateUrl: './changelog-item.component.html',
  styleUrls: ['./changelog-item.component.scss']
})
export class ChangelogItemComponent implements OnInit {
  user: User;
  author: any;
  @Input() changelog: any;
  @Input() contributors: User[];

  constructor(private userService: UserService) {
  }

  async ngOnInit() {

    if (this.contributors.every(contributor => contributor.userId === this.changelog.authorId)) {
      this.user = await this.userService.getUser(this.changelog.authorId);
      this.author = {
        name: this.user.name,
        profileImage: await this.userService.getGravatarImage(this.user.email, 200),
      };
    } else {
      this.author = {
        name: 'CLARK Editor',
        profileImage: 'assets/images/logo.png'
      };

    }
  }

}
