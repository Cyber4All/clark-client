import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'clark-generic-collection-logo',
    template: `
    <div class="title__icon" [ngClass]="{'title__icon--small': size === 'small'}">
      <i class="far fa-cubes"></i>
    </div>
  `,
    styleUrls: ['./generic-collection-logo.component.scss'],
    standalone: true,
    imports: [NgClass]
})
export class GenericCollectionLogoComponent {
  @Input() size: string;

  constructor() { }
}
