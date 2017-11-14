import { LearningObjectService } from './learning-object.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  openMenu = false;
  // FIXME: Convert 'class' to 'type' for consistancy
  groups;
  filteredGroups;
  query = undefined;

  constructor(public service: LearningObjectService) {
    service.observeFiltered().subscribe(groups => {
      this.groups = this.sort(groups);
    });
  }

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

  /* TODO: This function is no longer used in the template, however the general spoof functionality will be needed later.
           Remove comment block when implemented.

   spoofFilter(value) {
    console.log(value);
    if (value !== 'all') {
      this.filteredGroups = [
      {
        title: 'Course - 15 weeks',
        learningObjects: [
          { topic: 'Cybersecurity for Future Presidents', class: 'Course' }
        ]
      },
    ];
    } else {
      this.filteredGroups = undefined;
    }
  }
  */

  search() {
    // TODO: verify query contains alphanumeric characters
    if (this.query === '') {
      this.service.clearSearch();
    } else if (this.query !== undefined) {
      this.service.search(this.query);
    }
  }
}
