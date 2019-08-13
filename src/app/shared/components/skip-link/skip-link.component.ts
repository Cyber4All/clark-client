import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-skip-link',
  templateUrl: './skip-link.component.html',
  styleUrls: ['./skip-link.component.scss']
})
export class SkipLinkComponent implements OnInit {

  @Input() title: string;
  @Input() skipLocation: string;
  @Input() identity: string;
  constructor() { }

  ngOnInit() {
  }

  goToContent(value: string) {
    document.getElementById(value).focus();
  }

}
