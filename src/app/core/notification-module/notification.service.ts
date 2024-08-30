import { Injectable } from '@angular/core';
import { NOTIFICATIONS_ROUTES } from './notification.routes';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  userNotifications: { notifications: any[], count: number };
  constructor(private http: HttpClient) { }

  async getNotifications(username: string, page: number, limit: number): Promise<any> {
    return this.http
      .get(NOTIFICATIONS_ROUTES.GET_NOTIFICATIONS(username, page, limit), {
        withCredentials: true,
      })
      .toPromise();
  }

  async deleteNotification(username: string, notificationID: string): Promise<void> {
    this.http
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
  
    this.http.get(NOTIFICATIONS_ROUTES.GET_NOTIFICATIONS(username, 1, 1), {
        withCredentials: true,
      })
      .toPromise().then((val: any) => {
        this.userNotifications = val;
      });
  }
}
