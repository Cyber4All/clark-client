import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'clark-ncyte-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class NcyteDashboardComponent implements OnInit {
  when = 'All-time';
  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });
  email = '';

  constructor() { }

  ngOnInit(): void {
  }

  onDownload(): void {
    console.log(this.when);
    console.log(this.range.value);

    // const date = new Date()

    // const start = date.

    // const start: Date = this.range.value.start;
    // console.log(start);

    // console.log(start.getMonth());
    // console.log(start.getFullYear());
    // console.log(start.getDate());

    console.log(this.email);
  }
}
