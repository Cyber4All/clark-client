import { Component, OnInit, Input } from '@angular/core';
import { User } from '@entity';
import { OrganizationStore } from 'app/core/organization-module/organization.store';
import { UserService } from 'app/core/user-module/user.service';

@Component({
  selector: 'clark-author-card',
  templateUrl: './author-card.component.html',
  styleUrls: ['./author-card.component.scss']
})
export class AuthorCardComponent implements OnInit {

  @Input() author: User;
  @Input() profileImageURL: string;
  @Input() page: string;

  constructor(public orgStore: OrganizationStore, private userService: UserService) { }

  async ngOnInit() {
    // Author objects coming from some Learning Object responses can be partial and omit
    // organization fields; rehydrating by username gives a consistent User payload with
    // organizationId so OrganizationStore lookups render reliably.
    if (this.author?.username) {
      const fullUser = await this.userService.getUser(this.author.username);
      if (fullUser) {
        this.author = fullUser;
      }
    }
  }

}
