import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-changelog-item',
  templateUrl: './changelog-item.component.html',
  styleUrls: ['./changelog-item.component.scss']
})
export class ChangelogItemComponent implements OnInit {

  @Input() changelog: any;

  constructor() { }

  ngOnInit() {
  }

}
