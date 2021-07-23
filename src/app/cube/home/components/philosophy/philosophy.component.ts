import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-philosophy',
  templateUrl: './philosophy.component.html',
  styleUrls: ['./philosophy.component.scss']
})
export class PhilosophyComponent implements OnInit {
  values = [
    {
      title: 'Easy In',
      items: [
        'Bloom\'s Taxonomy',
        'Mutually Beneficial',
        'Easy Updates'
      ],
      icon: 'fal fa-cloud-upload'
    },
    {
      title: 'Quality Curriculum',
      items: [
        'Peer Review',
        'Active Curators',
        'Clear Learning Outcomes'
      ],
      icon: 'fal fa-check'
    },
    {
      title: 'Easy Out',
      items: [
        'Free Content',
        'No Hooks',
        'Faceted Search'
      ],
      icon: 'fal fa-cloud-download'
    },
    {
      title: 'Relevant',
      items: [
        'Crowdsourced Reviews',
        'Pertinent Topics',
        'Curriculum Revisions'
      ],
      icon: 'fal fa-users'
    },
    {
      title: 'Ownership',
      items: [
        'Content',
        'Format',
        'Web Presence'
      ],
      icon: 'fal fa-grin-beam'
    }
  ];

  constructor() { }

  ngOnInit(): void { }
}
