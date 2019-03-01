import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-lo-status-indicator',
  template: `
    <div
      *ngIf="status" class="top__status"
      [ngClass]="status"
      tip="{{ states?.get(status)?.tip }}"
      tipDisabled="{{ !states?.get(status)?.tip }}"
      tipLocation="bottom"
    >
      <span *ngIf="status === 'unreleased'"><i class="fas fa-eye-slash"></i></span>
      <span *ngIf="status === 'waiting'"><i class="fas fa-hourglass"></i></span>
      <span *ngIf="status === 'review'"><i class="fas fa-sync"></i></span>
      <span *ngIf="status === 'released'"><i class="fas fa-eye"></i></span>
      <span *ngIf="status === 'denied'"><i class="fas fa-ban"></i></span>
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
  @Input() status;
  @Input() states;

  constructor() { }

}
