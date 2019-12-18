import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-hierarchy-link',
  templateUrl: './hierarchy-link.component.html',
  styleUrls: ['./hierarchy-link.component.scss']
})
export class HierarchyLinkComponent implements OnInit {

  @Input() children: LearningObject[];
  @Input() parents: LearningObject[];

  constructor() { }

  ngOnInit() {
  }

}
