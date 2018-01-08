import { Injectable, OnInit } from '@angular/core';

@Injectable()
export class SortGroupsService {
    constructor() {

    }

    sort(groups) {
        const courses = [];
        const Modules = [];
        const Micromodules = [];
        const Nanomodules = [];
        const noclass = [];
        /*for(const g of groups){
        for(const lo of g.learningObjects){
        }
        }*/
        for (const lo of groups) {
            if (lo._length === 'course') { courses.push(lo); }
            if (lo._length === 'module') { Modules.push(lo); }
            if (lo._length === 'micromodule') { Micromodules.push(lo); }
            if (lo._length === 'nanomodule') { Nanomodules.push(lo); }
            if (lo._length === '') { noclass.push(lo); }
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
        console.log(sortedGroups);

        return sortedGroups;
    }

    sortByAlphabet(a, b) {
        if (a.topic < b.topic) { return -1; }
        if (a.topic > b.topic) { return 1; }
        return 0;
    }
}
