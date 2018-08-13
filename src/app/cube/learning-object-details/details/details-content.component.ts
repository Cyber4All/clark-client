import { Component, OnInit, Input } from '@angular/core';
import { EscapeHtmlPipe } from '../../../shared/pipes/keep-html.pipe';
import { COPY } from './details-content.copy';



@Component({
    selector: 'learning-object-details-content',
    templateUrl: './details-content.component.html',
    styleUrls: ['./details-content.component.scss']
})
export class DetailsContentComponent implements OnInit {
    copy = COPY;
    @Input() strategy: any;
    @Input() type: string;
    isShown: boolean;
    buttonText: string;


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
