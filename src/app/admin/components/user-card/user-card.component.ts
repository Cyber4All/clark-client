import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user.service';
import { trigger, transition, style, animate, query, animateChild, stagger } from '@angular/animations';

@Component({
  selector: 'clark-admin-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('menu', [
      transition(':enter', [
        query('*', [
          style({ opacity: 0 })
        ]),
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 })),
        query('*', [
          stagger(35, [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            animate('200ms ease', style({ opacity: 1, transform: 'translateY(0px)' }))
          ])
        ])
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms ease', style({ opacity: 0 }))
      ]),
    ]),
  ]
})
export class AdminUserCardComponent {
  @Input() user: User;
  @Input() reviewer = false;
  @Input() canEditPrivilege = false;

  @Output() navigateToUserObjects = new EventEmitter<string>();
  @Output() removeMember = new EventEmitter<string>();

  loading = false;
  @Output() editPrivileges: EventEmitter<void> = new EventEmitter();

  showMiddle: boolean;

  constructor(private userService: UserService, private cd: ChangeDetectorRef) {}

  toggleCardMenu(value) {
    this.showMiddle = value;
    this.cd.detectChanges();
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

  removeReviewer() {
    this.removeMember.emit(this.user.id);
  }
}
