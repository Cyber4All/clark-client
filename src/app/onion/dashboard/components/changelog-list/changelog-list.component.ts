import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-changelog-list',
  templateUrl: './changelog-list.component.html',
  styleUrls: ['./changelog-list.component.scss']
})
export class ChangelogListComponent implements OnInit {

  @Input() changelogs: [];

  constructor() { }

  ngOnInit() {
  }

}
