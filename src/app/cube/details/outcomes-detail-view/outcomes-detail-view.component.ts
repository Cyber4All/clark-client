import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cube-outcomes-detail-view',
  template: `
  <section class="outcomes-detail-view">
    <h1>Learning Outcomes</h1>
    <p class="no-content-alert" *ngIf="!(outcomes.length > 0)">
      This Learning Object doesn't have any learning outcomes.
    </p>
    <div class="outcomes" *ngFor="let o of outcomes; let i = index">
      <button
        class="header"
        [disabled]="!(o.mappings.length > 0)"
        (click)="toggleMappings(i)"
        [ngClass]="{ 'clickable': o.mappings.length > 0 }"
      >
        <span class="title">{{ o.outcome }}</span>
        <span class="mappings-count">({{ o.mappings.length }}&nbsp;Mapped&nbsp;Outcomes)</span>
      </button>
      <ul *ngIf="showMappings[i]">
        <div style="margin-top: 20px;"></div>
        <li *ngFor="let m of o.mappings">
        <span class="standard-author">{{ m.author }}</span>
        <span class="standard-name">{{ m.name }}</span>
        <span class="standard-outcome">{{ m.outcome }}</span>
        </li>
      </ul>
      <p *ngIf="outcomes.length < 1">This Learning Object does not contain any outcomes.</p>
    </div>
  </section>
  `,
  styleUrls: ['./outcomes-detail-view.component.scss']
})
export class OutcomesDetailViewComponent {
  @Input() outcomes;
  showMappings = [];

  constructor() { }

  toggleMappings(index: number) {
    this.showMappings[index] = !this.showMappings[index];
  }
}
