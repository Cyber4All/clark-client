import { Subject } from 'rxjs/Subject';
import { SuggestionService } from './../../suggestion/services/suggestion.service';
import { quizzes, instructions } from 'clark-taxonomy/dist/taxonomy';
import { verbs, assessments, levels } from 'clark-taxonomy';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, ElementRef, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { LearningObjectBuilderComponent } from '../learning-object-builder.component';

@Component({
  selector: 'learning-outcome-component',
  templateUrl: 'learning-outcome.component.html',
  styleUrls: ['./learning-outcome.component.scss'],
  providers: [SuggestionService],
})

export class LearningOutcomeComponent implements OnInit, OnChanges, OnDestroy {

  @Input() outcome;
  @Input('index') i;
  @Input() submitted: number;
  @Output() deleteIndex: EventEmitter<Number> = new EventEmitter<Number>();

  suggestOpen = false;
  suggestIndex: number;
  mappings: Array<Object>;
  bloomLevels;

  classverbs: { [level: string]: Set<string> };
  testquizstrategies: { [level: string]: Set<string> };
  classassessmentstrategies: { [level: string]: Set<string> };
  instructionalstrategies: { [level: string]: Set<string> };

  constructor(private el: ElementRef, private suggestionService: SuggestionService) {}

  ngOnInit() {
    // FIXME: classverbs should be sorted at the API
    this.classverbs = this.sortVerbs();

    this.bloomLevels = levels;
    this.testquizstrategies = quizzes;
    this.classassessmentstrategies = assessments;
    this.instructionalstrategies = instructions;

    this.suggestionService.mappedSubject.subscribe(val => {
      this.mappings = val;
      if (this.outcome) {
        this.outcome._mappings = this.mappings;
      }
    });
  }

  sortVerbs() {
    const sortedVerbs = verbs;
    sortedVerbs['Apply and Analyze'] = new Set(Array.from(sortedVerbs['Apply and Analyze']).sort(function (a, b) {
      const textA = a.toUpperCase();
      const textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    }));
    sortedVerbs['Remember and Understand'] = new Set(Array.from(sortedVerbs['Remember and Understand']).sort(function (a, b) {
      const textA = a.toUpperCase();
      const textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    }));
    sortedVerbs['Evaluate and Synthesize'] = new Set(Array.from(sortedVerbs['Evaluate and Synthesize']).sort(function (a, b) {
      const textA = a.toUpperCase();
      const textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    }));
    console.log(sortedVerbs);
    return sortedVerbs;
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  logSelect() {
    console.log(this.outcome._bloom);
    console.log(this.classverbs[this.outcome._bloom]);
  }

  updateFocus(i) {
    if (i !== this.suggestIndex) {
      this.suggestOpen = false;
    }
  }
  suggestionLoad(i) {
    this.suggestOpen = !this.suggestOpen;
    this.suggestIndex = i;
  }

  deleteOutcome() {
    this.deleteIndex.emit(this.i);
  }

  openBloomsInfo(index: number) {

  }

  get verbKeys(): Array<string> {
    return Object.keys(this.classverbs);
  }

  toggleActiveSquare(event) {
    const e = this.el.nativeElement.querySelectorAll('.outcome_bloom .square.active');
    for (let i = 0; i < e.length; i++) e[i].classList.remove('active');
    event.currentTarget.classList.add('active');

    this.outcome._bloom = event.currentTarget.attributes.data.value;
    this.outcome._verb = Array.from(this.classverbs[this.outcome._bloom].values())[0];
  }

  newInstructionalStrategy(i) {
    let newStrategy = this.outcome.addStrategy();
    newStrategy.instruction = this.instructionalstrategies[this.outcome._bloom][0];
    newStrategy.text = "";
  };

  newQuestion(i) {
      let newQuestion = this.outcome.addAssessment();
      newQuestion.plan = this.classassessmentstrategies[this.outcome._bloom][0];
      newQuestion.text = "";
  };

  deleteStrategy(i, s) {
      this.outcome.removeStrategy(s);
  }

  deleteQuestion(i, s) {
      this.outcome.removeAssessment(s);
  }

  bindEditorOutput(event, type, i, s) {
    if (type === 'question') {
        this.outcome.assessments[s].text = event;
    } else {
        if (type === 'strategy') {
            this.outcome.strategies[s].text = event;
        }
    }
  }

  validate(): boolean {
    // check bloom, text, and verb
    if (this.outcome._bloom === '') return false;
    if (this.outcome._text === '' || this.outcome._verb === '')
      return false;

    // check assessments
    /*for (const a of this.outcome._assessments) {
      if (a._plan === '' || a._text === '') return false;
    }
    // check strategies
    for (const i of this.outcome._strategies)
      if (i._instruction === '' || i._text === '') return false;
*/
    return true;
  }
  
  ngOnDestroy() {
    this.suggestionService.mappedSubject.unsubscribe();
  }

}
