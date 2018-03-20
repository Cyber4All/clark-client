import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'onion-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() outcomeCount;
  @Input() learningObjectName;

  links = ['Metadata'];

  activeIndex = 0;
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    console.log(this.outcomeCount);
  }

  ngOnChanges(changes) {
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
    this.activeIndex = i;
  }

  uploadMaterials() {
    this.router.navigateByUrl(
      `/onion/content/upload/${this.learningObjectName.trim()}`
    );
  }
}
