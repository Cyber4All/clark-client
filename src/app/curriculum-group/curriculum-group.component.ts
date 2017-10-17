import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-curriculum-group',
  templateUrl: './curriculum-group.component.html',
  styleUrls: ['./curriculum-group.component.css']
})
export class CurriculumGroupComponent implements OnInit {
  @Input('group') group;

  constructor() { }

  ngOnInit() { }

}
