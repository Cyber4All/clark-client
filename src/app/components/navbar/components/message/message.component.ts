import { Component, OnInit } from '@angular/core';
import { MessagesService, Message} from '../../../../core/messages.service';
import { environment } from '@env/environment';

@Component({
  selector: 'clark-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  showing = false;
  message: Message;

  constructor(private messages: MessagesService) { }

  ngOnInit() {
    if (environment.production) {
      setInterval(async () => {
        this.messages.getStatus().then(message => {
          this.message = message;
          this.showing = this.message.isUnderMaintenance;
        })
        .catch (e => {
          // FIXME: Suppress the error
        });
      }, 3000); // 5 min interval
    }
  }
}
