import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from 'clark-entity';

@Component({
  selector: 'app-modality',
  templateUrl: './modality.component.html',
  styleUrls: ['./modality.component.scss']
})
export class ModalityComponent implements OnInit {

  groups;

  constructor(private service: LearningObjectService) {
  }

  ngOnInit() {
    this.groups = this.sort(this.service.groups);
  }

  // FIXME: DRY (home.component.ts)
  sort(groups: LearningObject[]) {
    const courses = [];
    const Modules = [];
    const Micromodules = [];
    const Nanomodules = [];
    const noclass = [];
    for (const learningObject of groups) {
      if (learningObject.length === 'course') { courses.push(learningObject); }
      if (learningObject.length === 'module') { Modules.push(learningObject); }
      if (learningObject.length === 'micromodule') { Micromodules.push(learningObject); }
      if (learningObject.length === 'nanomodule') { Nanomodules.push(learningObject); }
      if (learningObject.length === '') { noclass.push(learningObject); }
    }
    const sortedGroups = [
      {
        title: 'Course - 15 weeks',
        learningObjects: courses.sort(this.sortByAlphabet)
      },
      {
        title: 'Module - 4 hours < completion time < 2 weeks',
        learningObjects: Modules.sort(this.sortByAlphabet),
      },
      {
        title: 'Micro-module – 1 hour < completion time < 4 hours',
        learningObjects: Micromodules.sort(this.sortByAlphabet),
      },
      {
        title: 'Nano-module – completion time < 1 hour',
        learningObjects: Nanomodules.sort(this.sortByAlphabet),
      },
      {
        title: 'No Type',
        learningObjects: noclass.sort(this.sortByAlphabet),
      }
    ];
    return sortedGroups;
  }

  sortByAlphabet(a, b) {
    if (a.topic < b.topic) { return -1; }
    if (a.topic > b.topic) { return 1; }
    return 0;
  }

}
