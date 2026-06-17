import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
    selector: 'clark-verification-badge',
    templateUrl: './verification-badge.component.html',
    styleUrls: ['./verification-badge.component.scss'],
    standalone: true,
    imports: [MatIcon, NgClass],
})
export class VerificationBadgeComponent {
  @Input() verified = false;
}
