import {Component, Input} from '@angular/core';
import { NgClass } from '@angular/common';
import { TipDirective } from '../../../shared/directives/tip.directive';

@Component({
    selector: 'clark-lo-status-indicator',
    template: `
    @if (status) {
      <div
        class="top__status"
        [ngClass]="status"
        [tip]="states?.get(status)?.tip"
        [tipDisabled]="!states?.get(status)?.tip"
        tipPosition="bottom"
        >
        @if (status === 'unreleased') {
          <span><i class="fas fa-eye-slash"></i></span>
        }
        @if (status === 'waiting') {
          <span><i class="fas fa-hourglass"></i></span>
        }
        @if (status === 'review') {
          <span><i class="fas fa-sync"></i></span>
        }
        @if (status === 'proofing') {
          <span><i class="fas fa-shield"></i></span>
        }
        @if (status === 'released') {
          <span><i class="fas fa-eye"></i></span>
        }
        @if (status === 'rejected') {
          <span><i class="fas fa-ban"></i></span>
        }
        @if (status === 'accepted_major') {
          <span><i class="fas fa-check"></i></span>
        }
        @if (status === 'accepted_minor') {
          <span><i class="fas fa-check-double"></i></span>
        }
      </div>
    }
    `,
    styleUrls: ['status-indicator.component.scss'],
    standalone: true,
    imports: [NgClass, TipDirective]
})
export class LearningObjectStatusIndicatorComponent {
  @Input() status;
  @Input() states;

  constructor() { }
}
