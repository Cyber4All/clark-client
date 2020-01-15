import { Component, OnInit, Input } from '@angular/core';
import { Mention } from 'app/core/press-coverage.service';

@Component({
  selector: 'clark-media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss']
})
export class MediaCardComponent implements OnInit {
  @Input() mention: Mention;
  imgSrc: string;

  constructor() { }

  ngOnInit() {
    this.imgSrc = '../../../../../assets/images/press/' + this.mention.icon;
  }

  /**
   * Open the media link in a new tab
   */
  followLink() {
    window.open(this.mention.link, '_blank');
  }

}
