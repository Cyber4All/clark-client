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
        this.name = this.learningObject.name;
        this.author = this.learningObject.author;
        this.lastUpdated = this.learningObject.date;
        this.type = this.learningObject.length;
    }
}
