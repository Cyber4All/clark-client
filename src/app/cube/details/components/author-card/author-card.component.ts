import { Component, OnInit, Input } from '@angular/core';
import { User } from '@entity';

@Component({
  selector: 'clark-author-card',
  templateUrl: './author-card.component.html',
  styleUrls: ['./author-card.component.scss']
})
export class AuthorCardComponent implements OnInit {

  @Input() author: User;
  @Input() profileImageURL: string;

  constructor() { }

  ngOnInit() {
  }
}
