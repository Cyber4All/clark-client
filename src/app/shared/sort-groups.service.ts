import { Injectable, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Injectable()
export class SortGroupsService {
    constructor() {

    }
    sortLength(learningObjects: LearningObject[]) {
        console.log(learningObjects);
        const courses: LearningObject[] = [];
        const Modules: LearningObject[] = [];
        const Micromodules: LearningObject[] = [];
        const Nanomodules: LearningObject[] = [];
        const noclass: LearningObject[] = [];

        learningObjects ? learningObjects.forEach((learningObject) => {
            if (learningObject.length === 'course') { courses.push(learningObject); }
            if (learningObject.length === 'module') { Modules.push(learningObject); }
            if (learningObject.length === 'micromodule') { Micromodules.push(learningObject); }
            if (learningObject.length === 'nanomodule') { Nanomodules.push(learningObject); }
            if (learningObject.length === '') { noclass.push(learningObject); }
        })
            : "No learningObjects to iterate over";

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

    sortAcademic(learningObjects: LearningObject[]) {
        console.log(learningObjects);
        const k12: LearningObject[] = [];
        const undergraduate: LearningObject[] = [];
        const graduate: LearningObject[] = [];
        const other: LearningObject[] = [];

        learningObjects ? learningObjects.forEach((learningObject) => {
            // TODO: Create a property on learningObject that holds the academic level. Will require database integration as well as an unpdate to entity, etc.
            /*if (learningObject.academic === 'k12') { k12.push(learningObject); }
            if (learningObject.academic === 'undergraduate') { undergraduate.push(learningObject); }
            if (learningObject.academic === 'graduate') { graduate.push(learningObject); }
            if (learningObject.academic === '') { other.push(learningObject); }*/
            undergraduate.push(learningObject);
        })
            : "No learningObjects to iterate over";

        const sortedGroups = [
            {
                 title: 'K-12',
                 learningObjects: k12.sort(this.sortByAlphabet)
            },
            {
                title: 'Undergraduate',
                learningObjects: undergraduate.sort(this.sortByAlphabet),
            },
            {
                title: 'Graduate',
                learningObjects: graduate.sort(this.sortByAlphabet),
            },
            {
                title: 'Other',
                learningObjects: other.sort(this.sortByAlphabet),
            }
        ];
        console.log(sortedGroups);
        return sortedGroups;
    }

    sortByAlphabet(a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) { return -1; }
        if (a.name.toLowerCase() > b.name.toLowerCase()) { return 1;  }
        return 0;
    }

}
