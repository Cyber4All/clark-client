import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { USER_ROUTES } from '@env/route';
import { AuthService } from '../../core/auth.service';

// TODO: Rename popup notifications to alerts?

@Injectable()
export class NotificationPresenter {

  constructor(private auth: AuthService, private http: HttpClient) { }

  get notifications() {
    return this.http.get(USER_ROUTES.GET_NOTIFICATIONS(this.auth.username), { withCredentials: true }).toPromise()
      .then((notififications: Notification[]) => {
        return notififications.map((notification: Notification) =>
          // Converts the numeric ISO date to the local date string for the view
          ({ ...notification, date: new Date(notification.date).toLocaleDateString() })
        );
      });
  }
}

interface Notification {
  text: string;
  date: number;
  link: string;
}
