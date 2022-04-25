import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-502-curators',
  templateUrl: './curators.component.html',
  styleUrls: ['./curators.component.scss']
})
export class Curators502Component implements OnInit {

  users: any[] = [
    {
      'name': 'Dr. Nathan Fisk',
      'email': 'fisk@usf.edu',
    },
    {
      'name': 'Kimberly DeFusco',
      'email': 'defusco@usf.edu',
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
