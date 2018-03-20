import { Output, EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'suggestion-filter',
    template: `
        <div class="filter-container">
        
            <div class="flex-item">
                <label for="author-filter">Author</label>
                <div class="select-wrapper">
                    <select name="author-filter" (change)="sourceChanged($event.target.value)">
                        <option value="{{s}}" *ngFor="let s of sources">{{ s }}</option>
                    </select>
                </div>
            </div>
        
            <div class="flex-item">
                <label for="date-filter">Date Published</label>
                <div class="select-wrapper">
                <select name="date-filter" (change)="dateChanged($event.target.value)">
                    <option value="{{d}}" *ngFor="let d of dates">{{ d }}</option>
                </select>
                </div>
            </div>
        
            <div class="flex-item">
            <label for="name-filter">Name Contains</label>
            <input 
                type="text" 
                placeholder="Outcome Name" 
                name="name-filter" 
                [ngModel]="_name" 
                (ngModelChange)="nameChanged($event)"
            />
            </div>
        </div>
    `,
    styles: [
        `.filter-container {
            display: -webkit-flex;
            display: flex;
            flex-direction: row;
            -webkit-flex-direction: row;
            margin-bottom: 30px;
        }`,
        `.flex-item {
            flex: 1;
            display: flex;
            margin-left: 20px;
        }
        .flex-item:nth-of-type(1) { margin-left: 0 }
        input, select {
            flex: 1;
        }
        select {
            background: white;
        }
        .select-wrapper .svg-inline--fa {
            z-index: 1;
        }
        label {
            padding-top: 5px;
            margin-right: 5px;
            margin-right: 10px;
        }
        `
    ]
})
export class SuggestionFilterComponent implements OnInit {

    sources = [
        'CAE Cyber Defense',
        'CAE Cyber Ops',
        'CCECC IT2014',
        'CS2013',
        'Military Academy',
        'NCWF',
        'NCWF KSAs',
        'NCWF Tasks',
        'CSEC'];
    // FIXME: Fetch dates from API
    dates = [
        'Any',
        '2017',
        '2013'
    ];
    _name;

    @Output() source = new EventEmitter<string>();
    @Output() date = new EventEmitter<number>();
    @Output() name = new EventEmitter<string>();

    constructor() { }

    ngOnInit() { }

    sourceChanged(source) { this.source.next(source); }

    dateChanged(date) { this.date.next(date); }

    nameChanged(name) { this.name.next(name); }
}