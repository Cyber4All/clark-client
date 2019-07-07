import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { LearningObject } from '@entity';
import { trigger, transition, state, style, animate } from '@angular/animations';

@Component({
  selector: 'clark-dashboard-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('accordion', [
      state('open', style({ height: '*', overflow: 'visible' })),
      state('closed', style({ height: '70px', overflow: 'hidden' })),
      transition('* => *', animate('{{ accordionSpeed }}ms ease'), { params: { accordionSpeed: 200 } })
    ])
  ]
})
export class ListComponent {
  @ViewChild('tableItems') tableItemsElement: ElementRef;

  @Input() showOptions: boolean;
  @Input() learningObjects: LearningObject[];
  @Input() title: string;

  state: 'open' | 'closed' = 'closed';

  toggle() {
    this.state = this.state === 'open' ? 'closed' : 'open';
  }

  get accordionSpeed() {
    return Math.min(Math.max(this.tableItemsElement.nativeElement.offsetHeight, 250), 600);
  }

}
