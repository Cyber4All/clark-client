import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { User } from '@entity';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'clark-contributor-pill',
    templateUrl: './contributor-pill.component.html',
    styleUrls: ['./contributor-pill.component.scss'],
    standalone: true,
    imports: [TitleCasePipe]
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
