import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'clark-details-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class DescriptionComponent {
  @Input() description: string;

}
