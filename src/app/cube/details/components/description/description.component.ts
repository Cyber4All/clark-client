import { Component, Input } from '@angular/core';

@Component({
    selector: 'clark-details-description',
    templateUrl: './description.component.html',
    styleUrls: ['./description.component.scss'],
    standalone: true,
})
export class DescriptionComponent {
  @Input() description: string;

}
