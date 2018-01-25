import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, Input } from '@angular/core';
import { EscapeHtmlPipe } from './../../shared/pipes/keep-html.pipe';


@Component({
    selector: 'learning-object-details-content',
    templateUrl: './details-content.component.html',
    styleUrls: ['./details-content.component.scss']
})
export class DetailsContentComponent implements OnInit {

    @Input() strategy: any;
    @Input() type: string;
    isShown: boolean;
    buttonText:string;


    constructor() { }
    ngOnInit() {
        this.buttonText = '+';
        this.isShown = false;
    }

    showContent() {
        this.isShown = !this.isShown;
        this.isShown ? this.buttonText = '-' : this.buttonText = '+';

    }
}
