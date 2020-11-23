import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  donate() {
    window.open('https://towsonuniversity.givingfuel.com/cybersecurity-education-initiatives', '_blank');
  }

}
