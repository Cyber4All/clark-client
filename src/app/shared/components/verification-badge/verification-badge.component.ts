import { Component, Input } from '@angular/core';

@Component({
  selector: 'clark-verification-badge',
  templateUrl: './verification-badge.component.html',
  styleUrls: ['./verification-badge.component.scss'],
})
export class VerificationBadgeComponent {
  @Input() verified = false;
}
