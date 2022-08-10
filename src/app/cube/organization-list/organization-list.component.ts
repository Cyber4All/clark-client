import { User } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';
import { Title } from '@angular/platform-browser';
import { TitleCasePipe } from '@angular/common';
import { titleCase } from 'title-case';

// This component sets its own page title
@Component({
  selector: 'clark-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {
  organization;
  members: Array<User>;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private titleService: Title,
    private titleCasePipe: TitleCasePipe
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      params['query']
        ? (this.organization = params['query'])
        : (this.organization = '');
    });
    this.fetchMembers();
    const title = this.titleCasePipe.transform(this.organization);
    this.titleService.setTitle(title + ' | CLARK');
  }

  async fetchMembers() {
    this.members = await this.userService.getOrganizationMembers(
      this.organization
    );
    // sorts by last name
    this.members.sort(function(a, b) {
      const first = a.name.substr(a.name.indexOf(' ') + 1).toUpperCase();
      const second = b.name.substr(b.name.indexOf(' ') + 1).toUpperCase();
      return first < second ? -1 : first > second ? 1 : 0;
    });
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
