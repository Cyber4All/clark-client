import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/core/user.service';
import {Router} from '@angular/router';
import { AuthUser } from 'app/core/auth.service';

@Component({
  selector: 'clark-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  searchBarPlaceholder = 'Users';
  users: AuthUser[];
  loading = false;

  showPrivileges: boolean;
  selectedUser: AuthUser;

  constructor(private user: UserService, private router: Router) { }

  ngOnInit() {
    this.getUsers('');
  }

  getUsers(text: string) {
    this.loading = true;
    this.user.searchUsers(text)
      .then(val => {
        console.log(val);
        this.users = val;
        this.loading = false;
      });
  }

  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects'], { queryParams: { username } });
  }

  editPrivileges(user: AuthUser) {
    this.selectedUser = user;
    this.showPrivileges = true;
  }

}
