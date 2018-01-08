import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { SortGroupsService } from '../shared/sort-groups.service';

@Component({
  selector: 'app-modality',
  templateUrl: './modality.component.html',
  styleUrls: ['./modality.component.scss']
})
export class ModalityComponent implements OnInit {

  groups;

  constructor(public service: LearningObjectService, public sorter: SortGroupsService) {
    this.groups = this.sorter.sort(service.groups);
  }

  ngOnInit() {
  }
}
