import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  data = [
    {
      image: '',
      title: 'NSA Funded Curriculum',
      link: ['/c','/nccp']
    },
    {
      image: '',
      title: 'The 502 Project',
      link: ['/collections', '/502-project']
    },
    {
      image: '',
      title: 'Gencyber',
      link: ['/c', '/gencyber']
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
