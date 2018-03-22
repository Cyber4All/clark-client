import { Component, OnInit } from '@angular/core';
import { MessagesService } from '../../../core/messages.service';

@Component({
  selector: 'clark-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  showing: boolean = false;
  message: Message;

  constructor(private messages: MessagesService) { }

  ngOnInit() {
    this.messages.getStatus().then(val => {
      if (val.length) {
        // message is set!
        this.message = new Message(val[0]['_id'], 'error', val[0]['maintenanceMessage']);

        const lastMessage = localStorage.getItem('maintenance');

        if (!lastMessage || this.message.id !== lastMessage) {
          this.open();
        }
      }
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

export class Message {
  id: string;
  type: string;
  message: string;

  constructor(id, type, message) {
    this.id = id;
    this.type = type;
    this.message = message;
  }
}