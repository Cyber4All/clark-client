import { Component, OnInit, Input } from '@angular/core';
import { OutageReport } from '../types/outageReport';

@Component({
  selector: 'clark-past-issue',
  templateUrl: './past-issue.component.html',
  styleUrls: ['./past-issue.component.scss']
})
export class PastIssueComponent implements OnInit {

  @Input() issue: OutageReport;
  icon: string;

  constructor() { }

  ngOnInit() {
  }

}
