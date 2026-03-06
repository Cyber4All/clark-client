import { Component, Input } from '@angular/core';

@Component({
  selector: 'clark-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss'],
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: number | string | null = null;
  @Input() textColor?: string;
}
