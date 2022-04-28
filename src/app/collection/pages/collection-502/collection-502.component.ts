import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-502-collection-index',
  templateUrl: './collection-502.component.html',
  styleUrls: ['./collection-502.component.scss']
})
export class Collection502Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  navigate(event: any) {
    // Navigation will happen here
    console.log('ahhsha',event);
  }

}
