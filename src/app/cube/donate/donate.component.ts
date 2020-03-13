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
    console.log('oh yest');
    window.open('https://towsonuniversity.givingfuel.com/towson-fund', '_blank');
  }

}
