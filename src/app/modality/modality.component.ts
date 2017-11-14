import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modality',
  templateUrl: './modality.component.html',
  styleUrls: ['./modality.component.scss']
})
export class ModalityComponent implements OnInit {

  groups;

  constructor(public service: LearningObjectService) {
    this.groups = this.sort(service.groups);
  }

  ngOnInit() {
  }

  // FIXME: DRY (home.component.ts)
  sort(groups) {
    const courses = [];
    const Modules = [];
    const Micromodules = [];
    const Nanomodules = [];
    const noclass = [];
    for (const g of groups) {
      for (const lo of g.learningObjects) {
        if (lo.class === 'Course') { courses.push(lo); }
        if (lo.class === 'Module') { Modules.push(lo); }
        if (lo.class === 'Micromodule') { Micromodules.push(lo); }
        if (lo.class === 'Nanomodule') { Nanomodules.push(lo); }
        if (lo.class === '') { noclass.push(lo); }
      }
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
