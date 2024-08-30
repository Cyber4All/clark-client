import { Injectable } from '@angular/core';
import { NOTIFICATIONS_ROUTES } from './notification.routes';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
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
    return deleteValue;
  }
}
