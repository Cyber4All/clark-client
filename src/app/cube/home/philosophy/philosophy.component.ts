import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-philosophy',
  templateUrl: './philosophy.component.html',
  styleUrls: ['./philosophy.component.scss']
})
export class PhilosophyComponent implements OnInit {
  values = [
    {
      title: 'Open',
      items: [
        'Source',
        'API',
        'Access'
      ],
      icon: 'far fa-box-open'
    },
    {
      title: 'Easy In',
      items: [
        'Bloom\'s Taxonomy',
        'Mutually Beneficial',
        'Easy Updates'
      ],
      icon: 'far fa-cloud-upload'
    },
    {
      title: 'Quality Curriculum',
      items: [
        'Peer Review',
        'Active Curators',
        'Clear Learning Outcomes'
      ],
      icon: 'far fa-check'
    },
    {
      title: 'Easy Out',
      items: [
        'Free Content',
        'No Hooks',
        'Faceted Search'
      ],
      icon: 'far fa-cloud-download'
    },
    {
      title: 'Crowdsourced',
      items: [
        'Curriculum',
        'Quality Control',
        'Currency'
      ],
      icon: 'far fa-users'
    },
    {
      title: 'Ownership',
      items: [
        'Content',
        'Format',
        'Web Presence'
      ],
      icon: 'far fa-grin-beam'
    }
  ];

  constructor() { }

  ngOnInit(): void { }
}
