import { Component, OnInit, Input } from '@angular/core';
import { trigger, transition, stagger, style, animate, query } from '@angular/animations';

@Component({
  selector: 'clark-changelog-list',
  templateUrl: './changelog-list.component.html',
  styleUrls: ['./changelog-list.component.scss'],
  animations: [
    trigger('stagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger('50ms', [
            animate('200ms ease', style({ opacity: 1, transform: 'translateY(0px)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ChangelogListComponent implements OnInit {

  @Input() changelogs: [];

  constructor() { }

  ngOnInit() {
  }
}
