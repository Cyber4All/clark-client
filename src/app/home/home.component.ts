import { LearningObjectService } from './../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { LearningObject } from 'clark-entity';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  query: string;
  groups;

  constructor(private service: LearningObjectService) {

  }

  ngOnInit() {
    this.service.observeFiltered().subscribe(groups => {
      this.groups = this.sort(groups);
    });
  }

  search() {
    // TODO: verify query contains alphanumeric characters
    if (this.query === '') {
      this.service.clearSearch();
    } else if (this.query !== undefined) {
      this.service.search(this.query);
    }
  }

  sort(groups: LearningObject[]) {
    const Courses = [];
    const Modules = [];
    const Micromodules = [];
    const Nanomodules = [];
    const noclass = [];
    for (const learningObject of groups) {
      if (learningObject.length.toLowerCase() === 'course') { Courses.push(learningObject); }
      if (learningObject.length.toLowerCase() === 'module') { Modules.push(learningObject); }
      if (learningObject.length.toLowerCase() === 'micromodule') { Micromodules.push(learningObject); }
      if (learningObject.length.toLowerCase() === 'nanomodule') { Nanomodules.push(learningObject); }
      if (learningObject.length.toLowerCase() === '') { noclass.push(learningObject); }
    }
    const sortedGroups = [
      {
        title: 'Course - 15 weeks',
        learningObjects: Courses.sort(this.sortByAlphabet)
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
