import { Component, OnInit, Input, OnChanges, Output, EventEmitter,
  SimpleChanges, IterableDiffers, DoCheck, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObjectStoreService } from '../../store';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AuthService } from '../../../../core/auth.service';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { navigate, SidebarService } from './sidebar.service';

@Component({
  selector: 'onion-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss'],
  providers: [SidebarService]
})
export class SidebarComponent implements OnInit, DoCheck, OnChanges, AfterViewChecked {
  @Input() outcomes: LearningOutcome[];
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

  public tips = TOOLTIP_TEXT;

  constructor(
    private router: Router,
    private store: LearningObjectStoreService,
    private auth: AuthService,
    private _iterableDiffers: IterableDiffers,
    public sidebarService: SidebarService,
  ) {
    this.outcomesDiffer = this._iterableDiffers.find([]).create(null);
  }

  ngOnInit() {
    console.log(this.outcomes);
    this.store.state.subscribe(state => {
      this.activeIndex = state.section;

      if (this.activeChildIndex !== state.childSection) {
        this.activeChildIndex = state.childSection;
      } else {
        this.activeChildIndex = undefined;
      }
    });
  }

  ngDoCheck() {
    const changes = this.outcomesDiffer.diff(this.outcomes);
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
    console.log(this.outcomes);
    const linkEl = this.sidebarService.links.filter(l => l.name === '2. Learning Outcomes')[0];
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

    self.buildOutcomes(self.outcomes, true);
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
