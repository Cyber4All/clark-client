import { Component, OnInit, Input } from '@angular/core';
import { Mention } from 'app/core/press-coverage.service';

@Component({
  selector: 'clark-media-item',
  templateUrl: './media-item.component.html',
  styleUrls: ['./media-item.component.scss']
})
export class MediaItemComponent implements OnInit {
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
