import {Component, Input} from '@angular/core';

@Component({
  selector: 'clark-lo-status-indicator',
  template: `
    <div
      *ngIf="status" class="top__status"
      [ngClass]="status"
      [tip]="states?.get(status)?.tip"
      [tipDisabled]="!states?.get(status)?.tip"
      tipPosition="bottom"
    >
      <span *ngIf="status === 'unreleased'"><i class="fas fa-eye-slash"></i></span>
      <span *ngIf="status === 'waiting'"><i class="fas fa-hourglass"></i></span>
      <span *ngIf="status === 'review'"><i class="fas fa-sync"></i></span>
      <span *ngIf="status === 'proofing'"><i class="fas fa-shield"></i></span>
      <span *ngIf="status === 'released'"><i class="fas fa-eye"></i></span>
      <span *ngIf="status === 'rejected'"><i class="fas fa-ban"></i></span>
    </div>
  `,
  styleUrls: ['status-indicator.component.scss']
})
export class LearningObjectStatusIndicatorComponent {
  @Input() status;
  @Input() states;

  constructor() { }
}
