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
        this.messages.getStatus()
        .then(message => {
          console.log(this.message);
          this.showing = true;
          this.message = message;
          const lastMessage = localStorage.getItem('maintenance');
        })
        .catch(e => {
          // FIXME: Suppress the error until we design a better backend solution
        });
      }, 300000); // 8 min interval
    }
  }
}
