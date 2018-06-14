import { User } from '@cyber4all/clark-entity';
import { Http } from '@angular/http';
import { USER_ROUTES } from '@env/route';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';

@Component({
  selector: 'clark-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {
  organization;
  members: Array<User>;


  constructor(private route: ActivatedRoute, private http: Http, private userService: UserService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      params['query'] ? this.organization = params['query'] : this.organization = '';
    });
    this.fetchMembers();
  }

  async fetchMembers() {
    this.members = await this.userService.getOrganizationMembers(this.organization);
    // sorts by last name
    this.members.sort(function (a, b) {
      const first = a.name.substr(a.name.indexOf(' ') + 1).toUpperCase();
      const second = b.name.substr(b.name.indexOf(' ') + 1).toUpperCase();
      return (first < second) ? -1 : (first > second) ? 1 : 0;
    });
  }
}
