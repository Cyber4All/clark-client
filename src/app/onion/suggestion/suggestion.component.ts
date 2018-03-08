import { SuggestionService } from './services/suggestion.service';
import {
  Component, EventEmitter, Input, KeyValueDiffers, KeyValueDiffer, OnInit, OnDestroy,
  OnChanges, Output, SimpleChanges, SimpleChange
} from '@angular/core';
import { providers } from 'ng2-dnd';
import { OutcomeSuggestion } from '@cyber4all/clark-entity';

/*
  TODO: Automatically check or hide standards that are currently mapped from the suggestion view
  TODO: Uncheck/unhide an outcome that is deselected from the mappings-list view
*/

@Component({
  selector: 'suggestion-component',
  templateUrl: './suggestion.component.html',
  styleUrls: ['suggestion.component.scss']
})
export class SuggestionComponent implements OnInit, OnChanges {

  private _differ: any;

  @Input('mappingsInput') mappingsInput: Array<OutcomeSuggestion> = [];

  mappings = new Map<string, OutcomeSuggestion>();
  standardAppear: boolean;
  standardOutcomes: Array<object> = [];
  connection;
  filter = {
    author: undefined,
    date: undefined,
    name: undefined
  };

  @Input('outcome') outcome: string;
  @Input() opened: boolean;

  ngOnInit() {
    this.standardAppear = false;
    this.connection = this.loader.observe().subscribe(data => {
      this.standardOutcomes = data as Array<object>;
    });
    this.loader.emit(this.outcome);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.outcome) {
      const o: string = changes.outcome.currentValue;
      if (o.substr(o.length - 1, o.length) === ' ') {
        this.loader.emit(this.outcome);
      }
    }

    if (changes.mappingsInput) {
      for (let m of changes.mappingsInput.currentValue) this.addStandard(m);
    }
  }

  constructor(private loader: SuggestionService, private _differs: KeyValueDiffers) {
    this._differ = _differs.find(this.filter).create();
  }

  open(content) {
    this.standardAppear = !this.standardAppear;
  }

  applyStandards() {

  }

  updateDate(e) {
    this.filter.date = e;
    this.loader.emit(this.outcome, this.filter);
  }

  updateSource(e) {
    this.filter.author = e;
    this.loader.emit(this.outcome, this.filter);
  }

  updateName(e) {
    this.filter.name = e;
    this.loader.emit(this.outcome, this.filter);
  }

  selectStandard(e, suggestion) {
    this.mappings.get(suggestion.id) !== undefined ? this.removeStandard(suggestion) : this.addStandard(suggestion);
  }

  addStandard(suggestion) {
    this.mappings.set(suggestion.id, suggestion);
    this.loader.addMapping(suggestion);
  }

  removeStandard(suggestion) {
    // Remove from local Map
    this.mappings.delete(suggestion.id);
    // Signal Removal from MappingsListComponent
    this.loader.removeMapping(suggestion);
  }

  removeStandardByID(id: string) {
    this.removeStandard(this.mappings.get(id));
  }

  allMappingsUsed(): boolean {
    return Array.from(this.mappings.values()).every(elem => this.standardOutcomes.indexOf(elem) > -1);
  }
}
