import { Injectable, OnInit } from '@angular/core';
import { LearningObject } from 'clark-entity';

@Injectable()
export class SortGroupsService {
    constructor() {

    }

    sort(groups: LearningObject[]) {
        const courses: LearningObject[] = [];
        const Modules: LearningObject[] = [];
        const Micromodules: LearningObject[] = [];
        const Nanomodules: LearningObject[] = [];
        const noclass: LearningObject[] = [];

        groups ? groups.forEach((learningObject) => {
            if (learningObject.length === 'course') { courses.push(learningObject); }
            if (learningObject.length === 'module') { Modules.push(learningObject); }
            if (learningObject.length === 'micromodule') { Micromodules.push(learningObject); }
            if (learningObject.length === 'nanomodule') { Nanomodules.push(learningObject); }
            if (learningObject.length === '') { noclass.push(learningObject); }
        })
            : "No groups to iterate over";

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
        console.log(sortedGroups);

        return sortedGroups;
    }

    sortByAlphabet(a, b) {
        if (a.topic < b.topic) { return -1; }
        if (a.topic > b.topic) { return 1; }
        return 0;
    }
}
