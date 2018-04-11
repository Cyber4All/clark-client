import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cube-outcomes-detail-view',
  template: `
  <section class="outcomes-detail-view">
    <h1>Learning Outcomes</h1>
    <div class="outcomes" *ngFor="let o of outcomes; let i = index">
      <div class="header" (click)="toggleMappings(i)" [ngClass]="{ 'clickable': o.mappings.length > 0 }">
        <div class="title">{{ o.outcome }}</div>
        <span class="mappings-count">({{ o.mappings.length }} Mapped Outcomes)</span>
      </div>
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
