import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'clark-details-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent {
  @Input() description: string;

}
