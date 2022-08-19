import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-registration-progress',
  templateUrl: './registration-progress.component.html',
  styleUrls: ['./registration-progress.component.scss']
})
export class RegistrationProgressComponent implements OnInit {

  @Input() index = 1;

  constructor() { }

  ngOnInit(): void {
  }

}
