import { Component, OnInit, Input } from '@angular/core';
import { levels } from '@cyber4all/clark-taxonomy';
import { LearningOutcome } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss']
})
export class OutcomeComponent implements OnInit {
  @Input() outcome: LearningOutcome;
  @Input() totalOutcomes: number;

  outcomeLevels = Array.from(levels.values());

  private _localText: string;
  private _localVerb: string;
  private _localLevel: string;

  constructor() { }

  ngOnInit() {
  }

  get outcomeNumber(): number {
    return (this.totalOutcomes || 0) + 1;
  }

  /**
   * Get value of localText
   */
  get text(): string {
    return this._localText;
  }

  /**
   * Get value of localLevel
   */
  get level(): string {
    return this._localLevel;
  }

  /**
   * Get value of localVerb
   */
  get verb(): string {
    return this._localVerb;
  }

  /**
   * Set the value of localText and emit
   */
  set text(val: string) {
    this._localText = val;
  }

  /**
   * Set the value of localLevel and emit
   */
  set level(val: string) {
    this._localLevel = val;
  }

  /**
   * Set the value of local verb and emit
   */
  set verb(val: string) {
    this._localVerb = val;
  }
}
