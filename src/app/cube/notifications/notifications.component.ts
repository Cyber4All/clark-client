import { Component, OnInit } from '@angular/core';
import { NotificationPresenter } from './notifications.presenter';

@Component({
  selector: 'clark-notifications-page',
  templateUrl: 'notifications.component.html',
  styleUrls: ['notifications.component.scss'],
  providers: [NotificationPresenter]
})
export class NotificationsComponent implements OnInit {
  notifications;

  constructor(private presenter: NotificationPresenter) { }

  ngOnInit() {
    this.presenter.notifications.then(notifications => {
      this.notifications = notifications;
    });
  }
}
