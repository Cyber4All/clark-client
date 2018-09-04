import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  /**
   * Number between 0 and 100 inclusive representing progress of task
   */
  @Input() percentage: number;

  constructor() { }

  ngOnInit() {
  }

}
