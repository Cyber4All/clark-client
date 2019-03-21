import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { User } from '@entity';

@Component({
  selector: 'clark-contributor-pill',
  templateUrl: './contributor-pill.component.html',
  styleUrls: ['./contributor-pill.component.scss']
})
export class ContributorPillComponent implements OnInit {
  @Input() user: User;

  @Output() removeContributor: EventEmitter<User> = new EventEmitter();

  // flags
  showDropdown: boolean;

  constructor() { }

  ngOnInit() {
  }

}
