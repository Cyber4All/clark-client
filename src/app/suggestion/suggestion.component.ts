import { SuggestionService } from './suggestion.service';
import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'suggestion-component',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.scss']
})
export class SuggestionComponent implements OnInit, OnDestroy, OnChanges {
  standardAppear: boolean;
  standardOutcomes: any;
  connection;
  @Input('query') query: SuggestionQuery;

  ngOnInit() {
    this.standardAppear = false;
    this.connection = this.loader.observe().subscribe(data => {
      this.standardOutcomes = data;
    });
    this.loader.emit(this.query);
  }
  ngOnDestroy() {
    // this.connection.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    const o: string = changes.query.currentValue.text;
    if (o.substr(o.length - 1, o.length) === ' ') {
      this.loader.emit(this.query);
    }
  }
  constructor(private loader: SuggestionService) {
    /*this.loader.getData().subscribe((data) => {
      this.standardOutcomes = data;
    });*/
  }

  open(content) {
    this.standardAppear = !this.standardAppear;
  }

  applyStandards() {

  }

  updateCheckbox(i, event) {
    console.log(i, event);
  }
}


export interface SuggestionQuery {
  text: string;
  filter: {
    author: string;
    name: string;
    ignoreme: string;
  };
}
