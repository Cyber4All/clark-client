import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  data = [
    {
      image: '/assets/images/collections/nccp.png',
      title: 'NSA Funded Curriculum',
      link: ['/c','nccp']
    },
    {
      image: '/assets/images/collections/502_project.png',
      title: 'The 502 Project',
      link: ['/collections', '502-project']
    },
    {
      image: '/assets/images/collections/gencyber.png',
      title: 'Gencyber',
      link: ['/c', 'gencyber']
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
