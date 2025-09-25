import { Component, Input, OnInit } from '@angular/core';
import { Tag } from '../../../../../entity/tag/tag';

@Component({
  selector: 'clark-tag-pill',
  templateUrl: './tag-pill.component.html',
  styleUrls: ['./tag-pill.component.scss']
})
export class TagPillComponent implements OnInit {
  @Input() tag: Tag;

  iconClass = 'far fa-book';

  constructor() { }

  ngOnInit(): void {
    switch(this.tag.type as any) {
      case 'badge':
        this.iconClass = 'far fa-certificate';
        break;
      case 'info':
        this.iconClass = 'far fa-info';
        break;
      case 'code':
        this.iconClass = 'far fa-code';
        break;
      case 'lang':
        this.iconClass = 'far fa-language';
        break;
      case 'tech':
        this.iconClass = 'far fa-microchip';
        break;
      case 'trending':
        this.iconClass = 'far fa-arrow-trend-up';
        break;
      case 'quality':
        this.iconClass = 'far fa-check';
        break;
      case 'work_role':
        this.iconClass = 'far fa-user';
        break;
      case 'modality':
        this.iconClass = 'far fa-chalkboard-teacher';
        break;
      case 'materials':
        this.iconClass = 'far fa-book';
        break;
      default:
        this.iconClass = 'far fa-information';
        break;
    }
  }

}
