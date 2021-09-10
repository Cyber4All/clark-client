import { Component, OnInit, Input } from '@angular/core';
import { User } from '@entity';
import { titleCase } from 'title-case';

@Component({
  selector: 'clark-author-card',
  templateUrl: './author-card.component.html',
  styleUrls: ['./author-card.component.scss']
})
export class AuthorCardComponent implements OnInit {

  @Input() author: User;
  @Input() profileImageURL: string;

  constructor() { }

  ngOnInit() {
  }

  /**
   * Function to conditionally set the title case of an organization
   *
   * @param organization string of the users affiliated organization
   * @returns string unformated or title cased
   */
   organizationFormat(organization: string) {
    if ( organization.charAt(1) === organization.charAt(1).toUpperCase() ) {
      return organization;
    } else {
      return titleCase(organization);
    }
  }

}
