import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-lo-status-indicator',
  template: `
    <div
      *ngIf="learningObject?.status" class="top__status"
      [ngClass]="learningObject?.status"
      tip="{{ states?.get(learningObject.status)?.tip }}"
      tipDisabled="{{ !states?.get(learningObject.status)?.tip }}"
      tipLocation="bottom"
    >
      <span *ngIf="learningObject?.status === 'unreleased'"><i class="fas fa-eye-slash"></i></span>
      <span *ngIf="learningObject?.status === 'waiting'"><i class="fas fa-hourglass"></i></span>
      <span *ngIf="learningObject?.status === 'review'"><i class="fas fa-sync"></i></span>
      <span *ngIf="learningObject?.status === 'released'"><i class="fas fa-eye"></i></span>
      <span *ngIf="learningObject?.status === 'denied'"><i class="fas fa-ban"></i></span>
    </div>
  `,
  styles: [`
    .top__status {
      width: 32px;
      height: 32px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgb(189, 193, 195);
      transition: all 0.2s ease;
      box-shadow: none;
      &.waiting {
        background: #5ec9da;
      }
      &.review {
        background: #f5a623;
      }
      &.released {
        background: $green;
      }
      &.denied {
        background: saturate($error-red, 15);
      }
      &:hover {
        box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.08);
      }
    }
  `]
})
export class LearningObjectStatusIndicatorComponent {
  @Input() learningObject;
  @Input() states;

  constructor() { }

}
