import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges, IterableDiffers, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObjectStoreService } from '../../store';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AuthService } from '../../../../core/auth.service';
import { LearningOutcome } from '@cyber4all/clark-entity';

interface SidebarLink {
  name: string;
  action: Function;
  classes?: string;
  children?: SidebarLink[];
  externalAction?: boolean;
}

@Component({
  selector: 'onion-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements OnInit, DoCheck, OnChanges {
  @Input() outcomes: LearningOutcome[];
  @Input() learningObjectName;
  @Output() newOutcome = new EventEmitter();
  @Output() upload = new EventEmitter();


  links: SidebarLink[] = [
    {
      name: 'Basic Information',
      action: this.navigate,
    },
    {
      name: 'Learning Outcomes',
      action: this.navigate,
      children: [
        {
          name: 'New Learning Outcome',
          action: this.createOutcome,
          externalAction: true,
          classes: 'new'
        }
      ]
    }
  ];

  activeIndex;
  activeChildIndex;
  outcomesDiffer;

  self = this;

  public tips = TOOLTIP_TEXT;
  
  constructor(
    private router: Router,
    private store: LearningObjectStoreService,
    private auth: AuthService,
    private _iterableDiffers: IterableDiffers
  ) {
    this.outcomesDiffer = this._iterableDiffers.find([]).create(null);
  }

  ngOnInit() {
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
    if (changes) {
      this.buildOutcomes(changes.collection);
    }
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
    const linkEl = this.links.filter(l => l.name === 'Learning Outcomes')[0];
    outcomes = outcomes.map((m: LearningOutcome, i: number) =>  ({ name: m.text && m.text !== '' ? m.outcome : 'Learning Outcome ' + (+i + 1), action: this.navigateChild }));

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

  // these contain references to 'self' because they're being passed as parameters to the Angular HTML where 'this' isn't the same
  navigate(i, self = this, parent = false) {
    const t = parent ? 'NAVIGATEPARENT' : 'NAVIGATE';
    self.store.dispatch({
      type: t,
      request: {
        sectionIndex: i
      }
    });
  }

  navigateChild(i, self = this) {
    self.buildOutcomes(self.outcomes, true);
    self.store.dispatch({
      type: 'NAVIGATECHILD',
      request: {
        sectionIndex: i
      }
    });
  }

  createOutcome(i, self = this) {
    self.newOutcome.emit();
  }

  uploadMaterials() {
    this.upload.emit();
  }
}
