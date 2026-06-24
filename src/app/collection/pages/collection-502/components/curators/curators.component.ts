import { Component, OnInit } from '@angular/core';
import { TitleComponent } from '../title/title.component';
import { NgFor } from '@angular/common';
import { CuratorCardComponent } from './components/curator-card/curator-card.component';

@Component({
    selector: 'clark-502-curators',
    templateUrl: './curators.component.html',
    styleUrls: ['./curators.component.scss'],
    standalone: true,
    imports: [TitleComponent, NgFor, CuratorCardComponent]
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
