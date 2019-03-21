import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { User } from '@cyber4all/clark-entity';
import { UserService } from 'app/core/user.service';

@Component({
  selector: 'clark-admin-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class AdminUserCardComponent implements OnInit {
  @Input() user: User;
  @Output() navigateToUserObjects: EventEmitter<void> = new EventEmitter();
  @Output() editPrivileges: EventEmitter<void> = new EventEmitter();

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  getGravatar() {
    return this.userService.getGravatarImage(
      this.user.email,
      200,
    );
  }

  showUserObjects() {
    this.navigateToUserObjects.emit();
  }

  editUserPrivileges() {
    this.editPrivileges.emit();
  }
}
