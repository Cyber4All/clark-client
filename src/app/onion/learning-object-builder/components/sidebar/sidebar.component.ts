import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObjectStoreService } from '../../store';

@Component({
  selector: 'onion-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() outcomeCount;
  @Input() learningObjectName;
  @Output() nav = new EventEmitter<number>();

  links = ['Metadata'];

  activeIndex;
  constructor(
    private router: Router,
    private store: LearningObjectStoreService
  ) { }

  ngOnInit() {
    this.store.state.subscribe(state => {
      this.activeIndex = state.section;
      if (this.activeIndex > this.outcomeCount) {
        this.uploadMaterials();
      }
    });
  }

  ngOnChanges(changes) {
    if (changes.outcomeCount) {
      this.buildMenu(changes);
    }
  }

  buildMenu(changes) {
    const outcomes = [];
    if (changes.outcomeCount.previousValue < changes.outcomeCount.currentValue) {
      for (let i = changes.outcomeCount.previousValue; i < this.outcomeCount; i++) {
        outcomes.push('Outcome ' + (i + 1));
      }
      this.links = [...this.links, ...outcomes];
    } else if (changes.outcomeCount.previousValue > changes.outcomeCount.currentValue) {
      console.log('We lost one!');
      for (let i = changes.outcomeCount.previousValue; i > changes.outcomeCount.currentValue; i--) {
        this.links.pop();
      }
    }
  }

  navigate(i) {
    this.store.dispatch({
      type: 'NAVIGATE',
      request: {
        sectionIndex: i
      }
    });
  }

  uploadMaterials() {
    this.router.navigateByUrl(
      `/onion/content/upload/${this.learningObjectName.trim()}`
    );
  }
}
