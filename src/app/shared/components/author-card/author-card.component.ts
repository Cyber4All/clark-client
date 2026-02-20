import { Component, OnInit, Input } from '@angular/core';
import { User } from '@entity';
import { OrganizationStore } from 'app/core/organization-module/organization.store';

@Component({
  selector: 'clark-author-card',
  templateUrl: './author-card.component.html',
  styleUrls: ['./author-card.component.scss']
})
export class AuthorCardComponent implements OnInit {

  @Input() author: User;
  @Input() profileImageURL: string;
  @Input() page: string;

  constructor(public orgStore: OrganizationStore) { }

  ngOnInit() {
  }

}
