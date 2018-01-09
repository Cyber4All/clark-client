import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from 'clark-entity';
import { SortGroupsService } from '../shared/sort-groups.service';

@Component({
  selector: 'app-modality',
  templateUrl: './modality.component.html',
  styleUrls: ['./modality.component.scss']
})
export class ModalityComponent implements OnInit {

  groups;

  constructor(private service: LearningObjectService, private sorter: SortGroupsService) { }

  ngOnInit() {
    this.groups = this.sorter.sort(this.service.groups);
  }
}
