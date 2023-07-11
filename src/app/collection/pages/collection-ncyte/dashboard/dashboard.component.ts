import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'clark-ncyte-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class NcyteDashboardComponent implements OnInit {
  when = 'All-time';

  constructor() { }

  ngOnInit(): void {
  }

  onDownload(): void {
    console.log(this.when);
  }

  onChange(event: MatRadioChange) {
    this.when = event.value;
  }
}
