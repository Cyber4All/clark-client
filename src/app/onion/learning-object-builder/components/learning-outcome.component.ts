import { Subject } from 'rxjs/Subject';
import { SuggestionService } from './../suggestion/services/suggestion.service';
import { quizzes, instructions } from 'clark-taxonomy/dist/taxonomy';
import { verbs, assessments, levels } from 'clark-taxonomy';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, ElementRef, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { LearningObjectBuilderComponent } from '../learning-object-builder.component';
import { ModalService } from '../../../shared/modals';

enum TABS {
  MAPPINGS,
  SUGGESTIONS,
  SEARCH
}
@Component({
  selector: 'onion-learning-outcome-component',
  templateUrl: 'learning-outcome.component.html',
  styleUrls: ['./learning-outcome.component.scss'],
  providers: [SuggestionService],
})
export class LearningOutcomeComponent implements OnInit, OnDestroy {

  tabs = TABS;
  activeTab: TABS;
  @Input() outcome;
  @Input('index') i;
  @Input() submitted: number;
  @Output() deleteIndex: EventEmitter<Number> = new EventEmitter<Number>();

  suggestOpen = false;
  openSearch = false;
  suggestIndex: number;
  mappings: Array<Object>;
  bloomLevels;

  classverbs: { [level: string]: Set<string> };
  testquizstrategies: { [level: string]: Set<string> };
  classassessmentstrategies: { [level: string]: Set<string> };
  instructionalstrategies: { [level: string]: Set<string> };

  constructor(private suggestionService: SuggestionService, public modalService: ModalService) {}

  ngOnInit() {
    this.activeTab = this.tabs.MAPPINGS;
    // FIXME: classverbs should be sorted at the API
    this.classverbs = this.sortVerbs();
    this.outcome._verb = Array.from(this.classverbs[this.outcome._bloom].values())[0];
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

  switchTab(tab: TABS, index?) {
    switch (tab) {
      case TABS.MAPPINGS:
        this.activeTab = tab;
        console.log('mappings');
        break;
      case TABS.SUGGESTIONS:
        this.activeTab = tab;
        console.log('suggestions', index);
        this.suggestionLoad(index);
        break;
      case TABS.SEARCH:
        this.activeTab = tab;
        console.log('search', index);
        this.openMappingsSearch(index);
        break;
      default:
      throw new Error('Invalid tab.');
    }
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
    return sortedVerbs;
  }

  registerBloomsLevel(level) {
    this.outcome._bloom = level;
    this.outcome._verb = Array.from(this.classverbs[this.outcome._bloom].values())[0];
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

  newInstructionalStrategy(i) {
    const newStrategy = this.outcome.addStrategy();
    newStrategy.instruction = this.instructionalstrategies[this.outcome._bloom][0];
    newStrategy.text = '';
  }

  newQuestion(i) {
      const newQuestion = this.outcome.addAssessment();
      newQuestion.plan = this.classassessmentstrategies[this.outcome._bloom][0];
      newQuestion.text = '';
  }

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
    if (this.outcome._bloom === '') { return false; }
    if (this.outcome._text === '' || this.outcome._verb === '') {
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    this.suggestionService.mappedSubject.unsubscribe();
  }

  openMappingsSearch(index) {
    this.openSearch = true;
  }

  addMappings(e) {
    this.openSearch = false;
    for (const m of e) {
      console.log(m);
      this.suggestionService.addMapping(m);
    }
  }
}
