import { Component, Input, OnChanges, Output, EventEmitter,
  SimpleChanges, IterableDiffers, DoCheck, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObjectStoreService } from '../../store';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AuthService } from '../../../../core/auth.service';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { navigate } from '../../store';

@Component({
  selector: 'onion-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements DoCheck, OnChanges, AfterViewChecked {
  _outcomes: LearningOutcome[] = [];
  @Input('outcomes')
  set outcomes(values: LearningOutcome[]) {
    console.log(values);
    this._outcomes = values;
  }
  @Input() learningObjectName;
  @Output() newOutcome = new EventEmitter();
  @Output() upload = new EventEmitter();

  forceOutcomesOpen = true;
  loaded = false;

  activeIndex;
  activeChildIndex;
  outcomesDiffer;

  self = this;
  navigate = navigate;
  links;
  public isEmailVerified;
  public tips = TOOLTIP_TEXT;

  constructor(
    private router: Router,
    private store: LearningObjectStoreService,
    private auth: AuthService,
    private _iterableDiffers: IterableDiffers,
  ) {
    this.outcomesDiffer = this._iterableDiffers.find([]).create(null);

    this.isEmailVerified = this.auth.user.emailVerified;
    this.store.state.subscribe(state => {
      this.activeIndex = state.section;
      this.activeChildIndex = state.childSection;
      this.links = state.sidebar.links;
    });
  }

  ngDoCheck() {
    const changes = this.outcomesDiffer.diff(this._outcomes);
    if (changes && this.loaded) {
      this.buildOutcomes(changes.collection);
    }
  }

  ngAfterViewChecked() {
    this.loaded = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildMenu(changes);
  }

  buildMenu(changes?: SimpleChanges) {
    if (changes && changes.outcomes) {
      this.buildOutcomes(changes.outcomes.currentValue, true);
    }
  }

  buildOutcomes(outcomes, noNav = false) {
    const linkEl = this.links.filter(l => l.name === '2. Learning Outcomes')[0];
    outcomes = outcomes.map((m: LearningOutcome, i: number) =>
      ({ name: m.text && m.text !== ''
        ? m.outcome :
        'Learning Outcome ' + (+i + 1), action: this.navigateChild }));

    linkEl.children = [...outcomes, linkEl.children[linkEl.children.length - 1]];

    if (!noNav) {
      if (linkEl.children.length > 1) {
        // we have outcomes, navigate to the last one
        this.navigateChild(linkEl.children.length - 2);
      } else {
        // we don't have outcomes, navigate to closest higher activeIndex
        if (this.activeIndex !== 0) {
          this.navigate(this.activeIndex - 1);
        } else {
          this.navigate(this.activeIndex + 1);
        }
      }
    }
  }

  navigateChild(i, self = this) {
    if (self.forceOutcomesOpen) {
      self.navigate(1, self, true);
    }

    self.buildOutcomes(self._outcomes, true);
    self.store.dispatch({
      type: 'NAVIGATECHILD',
      request: {
        sectionIndex: i
      }
    });
  }

  uploadMaterials() {
    this.upload.emit();
  }
}
