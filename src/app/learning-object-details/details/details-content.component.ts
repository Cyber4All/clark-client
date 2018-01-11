import { LearningObject } from 'clark-entity';
import { Component, OnInit, Input } from '@angular/core';
import { EscapeHtmlPipe } from './../../shared/pipes/keep-html.pipe';


@Component({
    selector: 'learning-object-details-content',
    templateUrl: './details-content.component.html',
    styleUrls: ['./details.component.css']
})
export class DetailsContentComponent implements OnInit {

    @Input() strategy: any;
    @Input() type: string;
    isShown: boolean;


    constructor() { }
    ngOnInit() {
        this.isShown = false;
    }

    showContent() {
        this.isShown = !this.isShown;
    }
}
