import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-edit-changelog',
  templateUrl: './edit-changelog.component.html',
  styleUrls: ['./edit-changelog.component.scss']
})
export class EditChangelogComponent implements OnInit {

  @Input() changelog: string;
  @Output() changelogChange: EventEmitter<string> = new EventEmitter();
  @Output() confirm: EventEmitter<void> = new EventEmitter();
  @Output() back: EventEmitter<void> = new EventEmitter();
  @Output() cancel: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
