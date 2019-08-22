import { Component, Input } from '@angular/core';
import { COPY } from '../../details.copy';

@Component({
  selector: 'cube-outcomes-detail-view',
  template: `
  <section class="outcomes-detail-view">
    <h1 tabindex="0">Learning Outcomes</h1>
    <p tabindex="0" class="no-content-alert" *ngIf="!(outcomes.length > 0)">
      This learning object doesn't have any learning outcomes.
    </p>
    <div [attr.tabindex]="!(o.mappings.length > 0)? 0 : -1" class="outcomes" *ngFor="let o of outcomes; let i = index">
      <button
        [attr.tabindex]="(o.mappings.length > 0)? 0 : -1"
        class="header"
        [disabled]="!(o.mappings.length > 0)"
        (activate)="toggleMappings(i)"
        [ngClass]="{ 'clickable': o.mappings.length > 0 }"
      >
        <span class="title">{{ o.outcome.charAt(0).toUpperCase() + o.outcome.substring(1) }}</span>
        <span class="mappings-count">({{ o.mappings.length }}&nbsp;Mapped&nbsp;Outcome<span *ngIf="o.mappings.length !== 1">s</span>)</span>
      </button>
      <ul *ngIf="showMappings[i]">
        <div style="margin-top: 20px;"></div>
        <li tabindex="0" *ngFor="let m of o.mappings">
        <span class="standard-author">{{ m.author }}</span>
        <span class="standard-name">{{ m.name }}</span>
        <span class="standard-outcome">{{ m.outcome }}</span>
        </li>
      </ul>
      <p *ngIf="outcomes.length < 1">{{ copy.NOOUTCOMES }}</p>
    </div>
  </section>
  `,
  styleUrls: ['./outcomes-detail-view.component.scss']
})
export class OutcomesDetailViewComponent {
  copy = COPY;
  @Input() outcomes;
  showMappings = [];

  constructor() { }

  toggleMappings(index: number) {
    this.showMappings[index] = !this.showMappings[index];
  }
}
