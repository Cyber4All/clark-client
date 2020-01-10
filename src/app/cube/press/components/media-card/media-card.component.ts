import { Component, OnInit, Input } from '@angular/core';
import { Mention } from 'app/core/press-coverage.service';

@Component({
  selector: 'clark-media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss']
})
export class MediaCardComponent implements OnInit {
  @Input() mention: Mention;

  constructor() { }

  ngOnInit() {
  }

}
