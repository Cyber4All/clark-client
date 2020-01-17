import { Component, OnInit } from '@angular/core';
import { PressCoverageService, Mention } from '../../core/press-coverage.service';
import * as AWS from 'aws-sdk';
import { writeFileSync } from 'fs';

@Component({
  selector: 'clark-press',
  templateUrl: './press.component.html',
  styleUrls: ['./press.component.scss']
})
export class PressComponent implements OnInit {

  mentions: Mention[];
  s3 = new AWS.S3();

  constructor(private coverageService: PressCoverageService) { }

  ngOnInit() {
    this.coverageService.getMentions().then(mentions => {
      this.mentions = mentions;
    });
  }

  downloadPressKit() {
    window.open('https://s3.amazonaws.com/clark.press/About_CLARK.pdf', '_blank');
  }

  downloadLogo() {
    window.open('https://s3.amazonaws.com/clark.press/logo.png', '_blank');
  }
}
