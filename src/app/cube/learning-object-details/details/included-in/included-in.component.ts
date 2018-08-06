import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cube-details-included-in',
  styleUrls: ['included-in.component.scss'],
  templateUrl: 'included-in.component.html'
})
export class DetailsIncludedInComponent implements OnInit {

  parents = [
    {
      name: 'DOCKER IS FÜN',
      link: '/details/donseannelly/DOCKER IS FÜN'
    },
    {
      name: 'Cybersecurity and Society',
      link: '/details/dark/Cybersecurity and Society'
    }
  ];

  constructor() { }

  ngOnInit() { }
}
