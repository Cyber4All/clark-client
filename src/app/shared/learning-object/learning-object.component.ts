import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'learning-object-component',
    templateUrl: 'learning-object.component.html',
    styleUrls: ['./learning-object.component.scss']
})
export class LearningObjectListingComponent implements OnInit {

    name;
    author;
    lastUpdated;
    type;

    @Input() learningObject;

    constructor() { }

    ngOnInit() {
        this.name = this.learningObject._name;
        this.author = this.learningObject._author;
        this.lastUpdated = this.learningObject._date;
        this.type = this.learningObject._length;
    }
}
