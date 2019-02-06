import { Component, OnInit } from '@angular/core';
import { MessagesService, Message } from '../../../core/messages.service';

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
    this.messages.getStatus()
      .then(message => {
        this.message = message;
        const lastMessage = localStorage.getItem('maintenance');

        if (!lastMessage || this.message.id !== lastMessage) {
          this.open();
        }
      })
      .catch(e => {
        // FIXME: Suppress the error until we design a better backend solution
      });
  }

  open() {
    this.showing = true;
  }

  close() {
    this.showing = false;
    localStorage.setItem('maintenance', this.message.id);
  }

  toggle() {
    this.showing = !this.showing;
  }
}
