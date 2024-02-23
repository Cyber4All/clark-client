import { Injectable } from '@angular/core';
import { NOTIFICATIONS_ROUTES } from './notification.routes';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class NotificationsService {
  userNotifications: any;
  constructor(private http: HttpClient) { }

  getNotifications(username: string): Promise<any> {
    return this.http
      .get(NOTIFICATIONS_ROUTES.GET_NOTIFICATIONS(username), {
        withCredentials: true,
      })
      .toPromise();
  }

  deleteNotification(username: string, notificationID: string) {
    const deleteValue = this.http
      .delete(
        NOTIFICATIONS_ROUTES.DELETE_NOTIFICATION(
          username,
          notificationID,
        ),
        {
          withCredentials: true,
        }
      )
      .toPromise();
    this.getNotificationCount(username);
    return deleteValue;
  }

  getNotificationCount(username: string) {
    this.http
      .get(NOTIFICATIONS_ROUTES.GET_NOTIFICATIONS(username), {
        withCredentials: true,
      })
      .toPromise()
      .then((val: any) => {
        this.userNotifications = val;
      });
  }
}
