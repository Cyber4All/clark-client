import { Component, OnInit } from '@angular/core';
import { User } from '@cyber4all/clark-entity';
import { UserService } from 'app/core/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'clark-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  searchBarPlaceholder = 'Users';
  users: User[];
  loading = false;

  constructor(private user: UserService, private router: Router) { }

  ngOnInit() {
  }

  getUsers(text: string) {
    this.loading = true;
    this.user.searchUsers(text)
      .then(val => {
        this.users = val;
        this.loading = false;
      });
  }

  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects']);
  }

}
