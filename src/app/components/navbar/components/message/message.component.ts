import { Component, OnInit } from '@angular/core';
import { MessagesService, Message} from '../../../../core/messages.service';
import { environment } from '@env/environment';

@Component({
  selector: 'clark-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  showBanner = true;
  message: Message;

  constructor(private messages: MessagesService) { }

  ngOnInit() {
    this.getMessage();
    setInterval(async () => {
      this.getMessage();
    }, 300000); // 5 min interval
  }

  getMessage() {
    this.messages.getStatus().then(message => {
      this.message = message;
      this.showBanner = this.message.isUnderMaintenance;
    })
    .catch ( _ => {
      /** Suppress the error because it is being handled in Gateway.
      If an error does occur there is not reason to show anything because a user doesn't know the request is being made. */
    });
  }
}
